import express from 'express';
import { PrismaClient, ProjectStatus } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// For MVP, we'll use a simple admin check
// In production, you'd want proper role-based access control
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

const isAdmin = async (req: any, res: express.Response, next: express.NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { email: true }
    });

    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

// Validation schemas
const reviewProjectSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional()
});

// Get pending projects for review
router.get('/projects/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true,
        title: true,
        description: true,
        githubUrl: true,
        techStack: true,
        category: true,
        impactDescription: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' } // Oldest first
    });

    res.json({ projects });
  } catch (error) {
    console.error('Get pending projects error:', error);
    res.status(500).json({ error: 'Failed to get pending projects' });
  }
});

// Review a project (approve/reject)
router.post('/projects/:id/review', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = reviewProjectSchema.parse(req.body);

    // Check if project exists and is pending
    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: { id: true, status: true, title: true }
    });

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (existingProject.status !== 'PENDING') {
      return res.status(400).json({ error: 'Project has already been reviewed' });
    }

    // Validate rejection reason if rejecting
    if (status === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required when rejecting a project' });
    }

    // Update project status
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        status: status as ProjectStatus,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        title: true,
        status: true,
        rejectionReason: true,
        creator: {
          select: {
            username: true,
            displayName: true,
            email: true
          }
        }
      }
    });

    res.json({ 
      project: updatedProject,
      message: `Project ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error('Review project error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to review project' });
  }
});

// Get admin dashboard stats
router.get('/dashboard/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [
      pendingCount,
      approvedCount,
      rejectedCount,
      totalUsers,
      totalProjects,
      recentProjects
    ] = await Promise.all([
      prisma.project.count({ where: { status: 'PENDING' } }),
      prisma.project.count({ where: { status: 'APPROVED' } }),
      prisma.project.count({ where: { status: 'REJECTED' } }),
      prisma.user.count(),
      prisma.project.count(),
      prisma.project.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          createdAt: true,
          creator: {
            select: {
              username: true,
              displayName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      stats: {
        projects: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          total: totalProjects
        },
        users: {
          total: totalUsers
        }
      },
      recentProjects
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get admin stats' });
  }
});

// Get all projects (approved, pending, rejected) for admin view
router.get('/projects/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as ProjectStatus | undefined;

    const offset = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          status: true,
          rejectionReason: true,
          createdAt: true,
          updatedAt: true,
          creator: {
            select: {
              username: true,
              displayName: true,
              avatarUrl: true
            }
          },
          _count: {
            select: { members: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      projects,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

export default router;