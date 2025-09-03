import * as express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all active Swedish races
router.get('/', async (req, res) => {
  try {
    const races = await prisma.race.findMany({
      where: { isActive: true },
      orderBy: { date: 'asc' }
    });

    res.json(races);
  } catch (error) {
    console.error('Get races error:', error);
    res.status(500).json({ error: 'Failed to get races' });
  }
});

// Get upcoming races (future dates only)
router.get('/upcoming', async (req, res) => {
  try {
    const now = new Date();
    
    const upcomingRaces = await prisma.race.findMany({
      where: {
        isActive: true,
        date: {
          gte: now
        }
      },
      orderBy: { date: 'asc' },
      take: 5
    });

    res.json(upcomingRaces);
  } catch (error) {
    console.error('Get upcoming races error:', error);
    res.status(500).json({ error: 'Failed to get upcoming races' });
  }
});

// Get single race by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const race = await prisma.race.findUnique({
      where: { id }
    });

    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }

    res.json(race);
  } catch (error) {
    console.error('Get race error:', error);
    res.status(500).json({ error: 'Failed to get race' });
  }
});

export default router;