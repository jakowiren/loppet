import express from 'express';
import { PrismaClient, ProjectCategory } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  githubUrl: z.string().url().optional().nullable(),
  techStack: z.array(z.string()).min(1, 'At least one technology is required').max(20),
  category: z.nativeEnum(ProjectCategory),
  impactDescription: z.string().min(20, 'Impact description must be at least 20 characters').max(2000)
});

const searchProjectsSchema = z.object({
  query: z.string().optional(),
  category: z.nativeEnum(ProjectCategory).optional(),
  techStack: z.array(z.string()).optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).optional().default('20')
});

// Get all approved projects with search/filter
router.get('/', optionalAuth, async (req: any, res) => {
  try {
    const {
      query,
      category,
      techStack,
      page,
      limit
    } = searchProjectsSchema.parse(req.query);

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'APPROVED'
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (techStack && techStack.length > 0) {
      where.techStack = {
        hasSome: techStack
      };
    }

    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
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
              username: true,
              displayName: true,
              avatarUrl: true
            }
          },
          _count: {
            select: { members: true }
          },
          members: req.userId ? {
            where: { userId: req.userId },
            select: { id: true }
          } : false
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.project.count({ where })
    ]);

    const projectsWithMembership = projects.map(project => ({
      ...project,
      isJoined: req.userId ? project.members.length > 0 : false,
      members: undefined // Remove the members array from response
    }));

    res.json({
      projects: projectsWithMembership,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Get project by ID
router.get('/:id', optionalAuth, async (req: any, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id, status: 'APPROVED' },
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
            githubUsername: true
          }
        },
        members: {
          select: {
            id: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                skills: true,
                githubUsername: true
              }
            }
          },
          orderBy: { joinedAt: 'asc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isJoined = req.userId ? 
      project.members.some(member => member.user.id === req.userId) : 
      false;

    const isOwner = req.userId === project.creator.id;

    res.json({
      project: {
        ...project,
        isJoined,
        isOwner
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Create new project
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const projectData = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        ...projectData,
        createdBy: req.userId,
        status: 'PENDING' // All projects start as pending for review
      },
      select: {
        id: true,
        title: true,
        description: true,
        githubUrl: true,
        techStack: true,
        category: true,
        impactDescription: true,
        status: true,
        createdAt: true,
        creator: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    res.status(201).json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Join project
router.post('/:id/join', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    // Check if project exists and is approved
    const project = await prisma.project.findUnique({
      where: { id, status: 'APPROVED' }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or not approved' });
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: req.userId
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Already a member of this project' });
    }

    // Add user as member
    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: req.userId
      },
      select: {
        id: true,
        joinedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    res.status(201).json({ member });
  } catch (error) {
    console.error('Join project error:', error);
    res.status(500).json({ error: 'Failed to join project' });
  }
});

// Leave project
router.delete('/:id/leave', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    // Check if user is a member
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: req.userId
        }
      }
    });

    if (!member) {
      return res.status(404).json({ error: 'Not a member of this project' });
    }

    // Remove membership
    await prisma.projectMember.delete({
      where: { id: member.id }
    });

    res.json({ message: 'Successfully left the project' });
  } catch (error) {
    console.error('Leave project error:', error);
    res.status(500).json({ error: 'Failed to leave project' });
  }
});

// Get project categories (for frontend forms)
router.get('/meta/categories', (req, res) => {
  const categories = Object.values(ProjectCategory).map(category => ({
    value: category,
    label: category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }));

  res.json({ categories });
});

export default router;