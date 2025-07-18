import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  skills: z.array(z.string()).max(20, 'Maximum 20 skills allowed').optional(),
  githubUsername: z.string().max(100).optional().nullable()
});

// Get user profile by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        skills: true,
        githubUsername: true,
        createdAt: true,
        createdProjects: {
          where: { status: 'APPROVED' },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            techStack: true,
            createdAt: true,
            _count: {
              select: { members: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        projectMembers: {
          where: { project: { status: 'APPROVED' } },
          select: {
            joinedAt: true,
            project: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                techStack: true,
                creator: {
                  select: {
                    username: true,
                    displayName: true,
                    avatarUrl: true
                  }
                }
              }
            }
          },
          orderBy: { joinedAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update current user's profile
router.put('/profile', authenticateToken, async (req: any, res) => {
  try {
    const updateData = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        skills: true,
        githubUsername: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ user });
  } catch (error) {
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

// Get user's dashboard data (own projects + joined projects)
router.get('/dashboard/data', authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        createdProjects: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            techStack: true,
            status: true,
            createdAt: true,
            _count: {
              select: { members: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        projectMembers: {
          select: {
            joinedAt: true,
            project: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                techStack: true,
                status: true,
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
              }
            }
          },
          orderBy: { joinedAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      createdProjects: user.createdProjects,
      joinedProjects: user.projectMembers.map(pm => ({
        ...pm.project,
        joinedAt: pm.joinedAt
      }))
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

export default router;