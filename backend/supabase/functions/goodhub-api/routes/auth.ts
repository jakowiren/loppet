import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Validation schemas
const googleAuthSchema = z.object({
  token: z.string().min(1, 'Google token is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50).optional(),
  skills: z.array(z.string()).max(20, 'Maximum 20 skills allowed').optional(),
  githubUsername: z.string().max(100).optional()
});

// Google OAuth login/register
router.post('/google', async (req, res) => {
  try {
    const { token, username, skills, githubUsername } = googleAuthSchema.parse(req.body);

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { googleId }
        ]
      }
    });

    if (user) {
      // Update existing user's Google info if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          avatarUrl: picture || user.avatarUrl,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new user
      if (!username) {
        return res.status(400).json({ 
          error: 'Username required for new users',
          needsUsername: true 
        });
      }

      // Check if username is taken
      const existingUsername = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      user = await prisma.user.create({
        data: {
          email,
          googleId,
          username,
          displayName: name || username,
          avatarUrl: picture,
          skills: skills || [],
          githubUsername: githubUsername || null
        }
      });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const jwtToken = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        skills: user.skills,
        githubUsername: user.githubUsername
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        skills: true,
        githubUsername: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Verify token endpoint
router.post('/verify', authenticateToken, (req: any, res) => {
  res.json({ valid: true, userId: req.userId });
});

export default router;