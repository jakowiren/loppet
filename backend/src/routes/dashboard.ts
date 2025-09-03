import { Router, Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: { id: string };
}

// GET /dashboard
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Fetch ads created by the logged-in user
    const userAdsRaw = await prisma.ad.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { favorites: true } } },
    });

    const userAds = userAdsRaw.map(ad => ({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      price: ad.price,
      category: ad.category || "",
      raceType: ad.raceType || "",
      condition: ad.condition || "",
      status: ad.status || "ACTIVE",
      createdAt: ad.createdAt,
      views: ad.views ?? 0,
      favorites: ad._count.favorites ?? 0,
      location: ad.location || "",
    }));

    // Fetch favorite ads of this user
    const favoriteAdsRaw = await prisma.favorite.findMany({
      where: { userId },
      include: {
        ad: {
          include: { _count: { select: { favorites: true } } }
        }
      }
    });

    const favoriteAds = favoriteAdsRaw.map(f => ({
      id: f.ad.id,
      title: f.ad.title,
      description: f.ad.description,
      price: f.ad.price,
      category: f.ad.category || "",
      raceType: f.ad.raceType || "",
      condition: f.ad.condition || "",
      status: f.ad.status || "ACTIVE",
      createdAt: f.ad.createdAt,
      views: f.ad.views ?? 0,
      favorites: f.ad._count.favorites ?? 0,
      location: f.ad.location || "",
    }));

    // Fetch recent activity (last 10 actions)
    const recentActivityRaw = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { ad: true },
    });

    const recentActivity = recentActivityRaw.map(a => ({
      id: a.id,
      type: a.activityType,
      adTitle: a.adTitle ?? a.ad?.title ?? "Okänd annons",
      timestamp: a.createdAt,
    }));

    // Stats
    const stats = {
      totalAds: userAds.length,
      activeAds: userAds.filter(a => a.status === "ACTIVE").length,
      totalViews: userAds.reduce((sum, a) => sum + a.views, 0),
      totalSold: userAds.filter(a => a.status === "SOLD").length,
      totalEarnings: userAds
        .filter(a => a.status === "SOLD")
        .reduce((sum, a) => sum + a.price, 0),
    };

    res.json({ userAds, favoriteAds, recentActivity, stats });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

export default router;
