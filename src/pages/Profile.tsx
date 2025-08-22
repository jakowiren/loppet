import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Settings, 
  Edit3, 
  Save, 
  X, 
  Bell, 
  Shield, 
  Eye,
  LogOut,
  Activity,
  ShoppingBag,
  Calendar,
  CheckCircle,
  Package,
  Clock,
  Heart,
  TrendingUp
} from "lucide-react";

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

// Empty data structure - will be populated from API when backend is ready
const MOCK_DASHBOARD_DATA: DashboardData = {
  userAds: [],
  favoriteAds: [],
  recentActivity: [],
  stats: {
    totalAds: 0,
    activeAds: 0,
    totalViews: 0,
    totalSold: 0,
    totalEarnings: 0
  }
};

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("aktivitet");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dashboardData] = useState<DashboardData>(MOCK_DASHBOARD_DATA);
  const [editForm, setEditForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setEditForm({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const isOwnProfile = !username || (user && username === user.username);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      
      const updateData = {
        displayName: editForm.displayName,
        phone: editForm.phone || undefined,
        location: editForm.location || undefined,
        bio: editForm.bio || undefined
      };
      
      const response = await userApi.updateProfile(updateData);
      
      // Update the user in AuthContext if successful
      if (response.user) {
        updateUser({
          displayName: response.user.displayName,
          phone: response.user.phone,
          location: response.user.location,
          bio: response.user.bio
        });
      }
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      setSaveError(error.response?.data?.error || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await userApi.deleteAccount();
      // Logout will redirect to homepage
      logout();
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      displayName: user?.displayName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || ''
    });
    setSaveError(null);
    setIsEditing(false);
  };

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

  // Show loading screen while auth is initializing
  if (isLoading && isOwnProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Laddar profil...</h2>
              <p className="text-gray-600">Väntar på inloggningsdata</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated after loading is complete
  if (!isAuthenticated && isOwnProfile && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Logga in för att se din profil</h2>
              <p className="text-gray-600">
                Logga in för att se och redigera din profil, kontaktinformation och inställningar.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" alt={editForm.displayName} />
                  <AvatarFallback className="bg-blue-600 text-white text-xl">
                    {editForm.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{editForm.displayName}</h1>
                  <p className="text-gray-600">{editForm.bio}</p>
                </div>
              </div>
              
              {isOwnProfile && (
                <Button
                  onClick={logout}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logga ut
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="aktivitet" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Aktivitet
            </TabsTrigger>
            <TabsTrigger value="installningar" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Inställningar
            </TabsTrigger>
          </TabsList>

          {/* Activity Tab - Dashboard Content */}
          <TabsContent value="aktivitet" className="mt-6">
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
                      <Button>Skapa din första annons</Button>
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
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="installningar" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Kontaktinformation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <Label htmlFor="displayName">Namn</Label>
                        <Input
                          id="displayName"
                          value={editForm.displayName}
                          onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">E-post</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Plats</Label>
                        <Input
                          id="location"
                          value={editForm.location}
                          onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Kort beskrivning</Label>
                        <Input
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        />
                      </div>
                      {saveError && (
                        <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
                          {saveError}
                        </div>
                      )}
                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={handleSave} 
                          disabled={isSaving}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? 'Sparar...' : 'Spara'}
                        </Button>
                        <Button 
                          onClick={handleCancel} 
                          variant="outline" 
                          disabled={isSaving}
                          className="flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Avbryt
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span>{editForm.email}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{editForm.phone}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{editForm.location}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          Redigera
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Account Actions */}
            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">Kontoinställningar</h3>
                    <p className="text-sm text-gray-500">Hantera ditt konto och data</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Tar bort...' : 'Ta bort konto'}
                    </Button>
                    
                    {showDeleteConfirm && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ta bort konto</h3>
                          <p className="text-gray-600 mb-6">
                            Är du säker på att du vill ta bort ditt konto? Detta kan inte ångras och all din data kommer att raderas permanent.
                          </p>
                          <div className="flex gap-3 justify-end">
                            <Button 
                              variant="outline" 
                              onClick={() => setShowDeleteConfirm(false)}
                              disabled={isDeleting}
                            >
                              Avbryt
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={handleDeleteAccount}
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Tar bort...' : 'Ta bort konto'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;