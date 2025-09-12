import * as express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50).optional(),
  displayName: z.string().min(1, 'Display name is required').max(100).optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional()
});

// Get user profile by username
router.get('/:username', optionalAuth, async (req: any, res) => {
  try {
    const { username } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        location: true,
        bio: true,
        rating: true,
        totalSales: true,
        createdAt: true,
        ads: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            title: true,
            price: true,
            category: true,
            condition: true,
            images: true,
            createdAt: true,
            views: true,
            favoritesCount: true
          },
          orderBy: { createdAt: 'desc' },
          take: 12
        },
        _count: {
          select: {
            ads: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't expose sensitive info to other users
    const isOwnProfile = req.userId === profile.id;
    
    res.json({
      ...profile,
      activeAdsCount: profile._count.ads,
      isOwnProfile
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update current user profile
router.put('/profile', authenticateToken, async (req: any, res) => {
  try {
    const updateData = updateProfileSchema.parse(req.body);

    // If username is being updated, check if it's available
    if (updateData.username) {
      const existingUser = await prisma.profile.findUnique({
        where: { username: updateData.username }
      });

      if (existingUser && existingUser.id !== req.userId) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        phone: true,
        location: true,
        bio: true,
        rating: true,
        totalSales: true,
        totalEarnings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ user: updatedProfile });

  } catch (error: any) {
    console.error('Update profile error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user dashboard data
router.get('/dashboard/stats', authenticateToken, async (req: any, res) => {
  try {
    const [profile, adStats, favorites, recentActivity] = await Promise.all([
      // Basic profile info
      prisma.profile.findUnique({
        where: { id: req.userId },
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
          rating: true,
          totalSales: true,
          totalEarnings: true
        }
      }),

      // Ad statistics
      prisma.ad.groupBy({
        by: ['status'],
        where: { sellerId: req.userId },
        _count: { status: true }
      }),

      // User's favorites
      prisma.favorite.findMany({
        where: { userId: req.userId },
        include: {
          ad: {
            select: {
              id: true,
              title: true,
              price: true,
              category: true,
              images: true,
              status: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Recent activity
      prisma.activity.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Process ad statistics
    const adStatistics = {
      total: 0,
      active: 0,
      sold: 0,
      paused: 0
    };

    adStats.forEach(stat => {
      adStatistics.total += stat._count.status;
      if (stat.status === 'ACTIVE') adStatistics.active = stat._count.status;
      if (stat.status === 'SOLD') adStatistics.sold = stat._count.status;
      if (stat.status === 'PAUSED') adStatistics.paused = stat._count.status;
    });

    res.json({
      profile,
      adStatistics,
      favorites: favorites.map(fav => fav.ad),
      recentActivity,
      summary: {
        totalAds: adStatistics.total,
        activeAds: adStatistics.active,
        soldAds: adStatistics.sold,
        totalFavorites: favorites.length,
        totalEarnings: profile.totalEarnings
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Delete user account
router.delete('/account', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.userId;

    // Delete user profile and all related data (cascades will handle the rest)
    await prisma.profile.delete({
      where: { id: userId }
    });

    res.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;