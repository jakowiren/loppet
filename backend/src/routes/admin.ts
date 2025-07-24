import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Simple admin check - you can enhance this with proper role-based auth
const isAdmin = async (req: any, res: express.Response, next: express.NextFunction) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.userId },
      select: { email: true }
    });

    // Simple admin check - you can replace with proper admin role system
    const adminEmails = ['admin@loppet.se', 'jakob@loppet.se']; // Add your admin emails
    
    if (!profile || !adminEmails.includes(profile.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Admin verification failed' });
  }
};

// Get admin dashboard stats
router.get('/dashboard', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [userCount, adStats, recentActivity] = await Promise.all([
      prisma.profile.count(),
      
      prisma.ad.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              username: true,
              displayName: true
            }
          }
        }
      })
    ]);

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
      totalUsers: userCount,
      adStatistics,
      recentActivity
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to get admin dashboard' });
  }
});

// Get all ads for admin review
router.get('/ads', authenticateToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && ['ACTIVE', 'SOLD', 'PAUSED'].includes(status)) {
      where.status = status;
    }

    const [ads, totalCount] = await Promise.all([
      prisma.ad.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: {
            select: {
              username: true,
              displayName: true,
              email: true,
              rating: true
            }
          }
        }
      }),
      prisma.ad.count({ where })
    ]);

    res.json({
      ads,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Admin get ads error:', error);
    res.status(500).json({ error: 'Failed to get ads' });
  }
});

export default router;