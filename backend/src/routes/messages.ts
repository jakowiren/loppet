import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createMessageSchema = z.object({
  adId: z.string().uuid('Invalid ad ID'),
  content: z.string().min(1, 'Message content is required').max(1000, 'Message too long')
});

// Send a message to the seller of an ad
router.post('/send', authenticateToken, async (req: any, res) => {
  try {
    const { adId, content } = createMessageSchema.parse(req.body);
    const buyerId = req.userId;

    // Get the ad and seller information
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: { seller: true }
    });

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    if (ad.sellerId === buyerId) {
      return res.status(400).json({ error: 'You cannot message yourself' });
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        adId,
        buyerId,
        sellerId: ad.sellerId
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          adId,
          buyerId,
          sellerId: ad.sellerId,
          lastMessageAt: new Date()
        }
      });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        fromUserId: buyerId,
        content
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    // Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() }
    });

    res.json({
      message: 'Message sent successfully',
      conversationId: conversation.id,
      messageId: message.id
    });

  } catch (error: any) {
    console.error('Send message error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get user's conversations
router.get('/conversations', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.userId;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      },
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true
          }
        },
        buyer: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        },
        seller: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
          include: {
            fromUser: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    const formattedConversations = conversations.map(conversation => ({
      id: conversation.id,
      ad: conversation.ad,
      otherUser: conversation.buyerId === userId ? conversation.seller : conversation.buyer,
      lastMessage: conversation.messages[0] || null,
      lastMessageAt: conversation.lastMessageAt,
      status: conversation.status
    }));

    res.json({ conversations: formattedConversations });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', authenticateToken, async (req: any, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { sentAt: 'asc' }
    });

    res.json({ messages });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send message in an existing conversation
router.post('/conversations/:conversationId/messages', authenticateToken, async (req: any, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = z.object({
      content: z.string().min(1).max(1000)
    }).parse(req.body);

    const userId = req.userId;

    // Check user belongs to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Create new message
    const message = await prisma.message.create({
      data: {
        conversationId,
        fromUserId: userId,
        content
      },
      include: {
        fromUser: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
          }
        }
      }
    });

    // Update last message timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    res.json({ message });
  } catch (error: any) {
    console.error('Send conversation message error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    res.status(500).json({ error: 'Failed to send message' });
  }
});


export default router;