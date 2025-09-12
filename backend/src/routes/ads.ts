import express from 'express';
import { PrismaClient, AdCategory, AdCondition, AdStatus } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createAdSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(2000),
  price: z.number().int().positive('Price must be positive'),
  category: z.nativeEnum(AdCategory),
  condition: z.nativeEnum(AdCondition),
  location: z.string().min(1, 'Location is required').max(100),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed').optional()
});

const updateAdSchema = createAdSchema.partial().extend({
  status: z.nativeEnum(AdStatus).optional()
});

const searchAdsSchema = z.object({
  search: z.string().optional(),
  category: z.nativeEnum(AdCategory).optional(),
  condition: z.nativeEnum(AdCondition).optional(),
  location: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
  sortBy: z.enum(['createdAt', 'price', 'views', 'favoritesCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Get all active ads with search and filtering
router.get('/', optionalAuth, async (req: any, res) => {
  try {
    const {
      search,
      category,
      condition,
      location,
      minPrice,
      maxPrice,
      page,
      limit,
      sortBy,
      sortOrder
    } = searchAdsSchema.parse(req.query);

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'ACTIVE'
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) where.category = category;
    if (condition) where.condition = condition;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const [ads, totalCount] = await Promise.all([
      prisma.ad.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          seller: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              rating: true,
              location: true,
              email: true
            }
          },
          _count: {
            select: { favorites: true }
          }
        }
      }),
      prisma.ad.count({ where })
    ]);

    // Get user's favorites if authenticated
    let userFavorites: Set<string> = new Set();
    if (req.userId) {
      const favorites = await prisma.favorite.findMany({
        where: { userId: req.userId },
        select: { adId: true }
      });
      userFavorites = new Set(favorites.map(f => f.adId));
    }

    // Sort ads to put favorites first if user is authenticated
    const sortedAds = req.userId 
      ? ads.sort((a, b) => {
          const aFav = userFavorites.has(a.id) ? 1 : 0;
          const bFav = userFavorites.has(b.id) ? 1 : 0;
          return bFav - aFav; // Favorites first
        })
      : ads;

    res.json({
      ads: sortedAds.map(ad => ({
        ...ad,
        favoritesCount: ad._count.favorites,
        isFavorited: userFavorites.has(ad.id)
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error: any) {
    console.error('Get ads error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to get ads' });
  }
});

// Get single ad by ID
router.get('/:id', optionalAuth, async (req: any, res) => {
  try {
    const { id } = req.params;

    const ad = await prisma.ad.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            rating: true,
            location: true,
            totalSales: true,
            createdAt: true,
            email: true
          }
        },
        _count: {
          select: { favorites: true }
        }
      }
    });

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Increment view count
    await prisma.ad.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    // Check if user has favorited this ad
    let isFavorited = false;
    if (req.userId) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_adId: {
            userId: req.userId,
            adId: id
          }
        }
      });
      isFavorited = !!favorite;
    }

    res.json({
      ...ad,
      favoritesCount: ad._count.favorites,
      isFavorited
    });

  } catch (error) {
    console.error('Get ad error:', error);
    res.status(500).json({ error: 'Failed to get ad' });
  }
});

// Create new ad
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const adData = createAdSchema.parse(req.body);

    const ad = await prisma.ad.create({
      data: {
        ...adData,
        images: adData.images || [],
        status: 'ACTIVE',
        seller: {
          connect: { id: req.userId }
        }
      },
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            rating: true,
            location: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(ad);

  } catch (error: any) {
    console.error('Create ad error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create ad' });
  }
});

// Update ad (only by owner)
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const updateData = updateAdSchema.parse(req.body);

    // Check if ad exists and user owns it
    const existingAd = await prisma.ad.findUnique({
      where: { id },
      select: { sellerId: true }
    });

    if (!existingAd) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    if (existingAd.sellerId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this ad' });
    }

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            rating: true,
            location: true,
            email: true
          }
        }
      }
    });

    res.json(updatedAd);

  } catch (error: any) {
    console.error('Update ad error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to update ad' });
  }
});

// Delete ad (only by owner)
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    // Check if ad exists and user owns it
    const existingAd = await prisma.ad.findUnique({
      where: { id },
      select: { sellerId: true }
    });

    if (!existingAd) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    if (existingAd.sellerId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this ad' });
    }

    await prisma.ad.delete({
      where: { id }
    });

    res.json({ message: 'Ad deleted successfully' });

  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ error: 'Failed to delete ad' });
  }
});

// Toggle favorite
router.post('/:id/favorite', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    // Check if ad exists
    const ad = await prisma.ad.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_adId: {
          userId: req.userId,
          adId: id
        }
      }
    });

    if (existingFavorite) {
      // Remove favorite
      await prisma.favorite.delete({
        where: {
          userId_adId: {
            userId: req.userId,
            adId: id
          }
        }
      });

      res.json({ isFavorited: false, message: 'Removed from favorites' });
    } else {
      // Add favorite
      await prisma.favorite.create({
        data: {
          userId: req.userId,
          adId: id
        }
      });

      res.json({ isFavorited: true, message: 'Added to favorites' });
    }

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// Get ad categories (enum values)
router.get('/metadata/categories', (req, res) => {
  res.json({
    categories: Object.values(AdCategory),
    conditions: Object.values(AdCondition)
  });
});

export default router;