import * as express from 'express';
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

// Validation schemas for marketplace
const googleAuthSchema = z.object({
  token: z.string().min(1, 'Google token is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50).optional(),
  phone: z.string().optional(),
  location: z.string().max(100).optional(),
  bio: z.string().max(500).optional()
});

// Google OAuth login/register
router.post('/google', async (req, res) => {
  try {
    const { token, username, phone, location, bio } = googleAuthSchema.parse(req.body);

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

    // Check if profile exists
    let profile = await prisma.profile.findUnique({
      where: { email }
    });

    if (!profile) {
      // Check if username is provided for new users
      if (!username) {
        return res.status(400).json({ 
          error: 'Username required for new users',
          needsUsername: true 
        });
      }

      // Check if username is already taken
      const existingUsername = await prisma.profile.findUnique({
        where: { username }
      });

      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Create new profile
      profile = await prisma.profile.create({
        data: {
          email,
          username,
          displayName: name || username,
          avatarUrl: picture || null,
          phone: phone || null,
          location: location || null,
          bio: bio || null
        }
      });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: profile.id, email: profile.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        rating: profile.rating,
        totalSales: profile.totalSales,
        totalEarnings: profile.totalEarnings,
        createdAt: profile.createdAt
      }
    });

  } catch (error: any) {
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

// Get current user profile
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.userId },
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
        createdAt: true
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ user: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Verify JWT token
router.post('/verify', authenticateToken, async (req: any, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.userId },
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
        createdAt: true
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ 
      valid: true,
      user: profile
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

export default router;