import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Calendar,
  ExternalLink,
  Loader2,
  ShoppingBag,
  User,
  Heart,
  Eye,
  TrendingUp,
  Package
} from 'lucide-react';

interface UserAd {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  raceType: string;
  condition: string;
  status: 'ACTIVE' | 'SOLD' | 'PAUSED';
  createdAt: string;
  views: number;
  favorites: number;
  location: string;
}

interface DashboardData {
  userAds: UserAd[];
  favoriteAds: UserAd[];
  recentActivity: Array<{
    id: string;
    type: 'AD_CREATED' | 'AD_SOLD' | 'AD_FAVORITED' | 'MESSAGE_RECEIVED';
    adTitle: string;
    timestamp: string;
  }>;
  stats: {
    totalAds: number;
    activeAds: number;
    totalViews: number;
    totalSold: number;
    totalEarnings: number;
  };
}

// Mock data for demonstration
const MOCK_DASHBOARD_DATA: DashboardData = {
  userAds: [
    {
      id: "1",
      title: "Trek Speed Concept - Timetrial cykel",
      description: "Professionell timetrial cykel i utmärkt skick",
      price: 45000,
      category: "Cyklar",
      raceType: "Triathlon",
      condition: "Mycket bra",
      status: "ACTIVE",
      createdAt: "2025-01-15",
      views: 234,
      favorites: 12,
      location: "Stockholm"
    },
    {
      id: "2",
      title: "Garmin Forerunner 945",
      description: "Komplett triathlon-klocka med alla funktioner",
      price: 6500,
      category: "Klockor",
      raceType: "Triathlon",
      condition: "Mycket bra",
      status: "SOLD",
      createdAt: "2025-01-10",
      views: 156,
      favorites: 8,
      location: "Stockholm"
    }
  ],
  favoriteAds: [],
  recentActivity: [
    {
      id: "1",
      type: "AD_CREATED",
      adTitle: "Trek Speed Concept",
      timestamp: "2025-01-15"
    },
    {
      id: "2",
      type: "AD_SOLD",
      adTitle: "Garmin Forerunner 945",
      timestamp: "2025-01-14"
    }
  ],
  stats: {
    totalAds: 12,
    activeAds: 8,
    totalViews: 1240,
    totalSold: 4,
    totalEarnings: 89500
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData] = useState<DashboardData>(MOCK_DASHBOARD_DATA);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'SOLD':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'PAUSED':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Aktiv';
      case 'SOLD':
        return 'Såld';
      case 'PAUSED':
        return 'Pausad';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SOLD':
        return 'bg-blue-100 text-blue-800';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Min dashboard</h1>
          <p className="text-gray-600">Välkommen tillbaka, {user?.displayName}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User's Ads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Mina annonser
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.userAds.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Du har inga annonser än</p>
                  <Link to="/skapa-annons">
                    <Button>Skapa din första annons</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.userAds.slice(0, 3).map((ad) => (
                    <div key={ad.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ad.status)}
                          <Badge className={getStatusColor(ad.status)}>
                            {getStatusLabel(ad.status)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{ad.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-blue-600">{formatPrice(ad.price)}</span>
                        <div className="flex items-center gap-4 text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {ad.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {ad.favorites}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {dashboardData.userAds.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" size="sm">
                        Visa alla annonser ({dashboardData.userAds.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Senaste aktivitet
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Ingen aktivitet än</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {activity.type === 'AD_CREATED' && `Skapade annons "${activity.adTitle}"`}
                          {activity.type === 'AD_SOLD' && `Sålde "${activity.adTitle}"`}
                          {activity.type === 'AD_FAVORITED' && `Någon gillade "${activity.adTitle}"`}
                          {activity.type === 'MESSAGE_RECEIVED' && `Fick meddelande om "${activity.adTitle}"`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;