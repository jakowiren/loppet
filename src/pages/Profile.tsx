import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
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
  MessageCircle,
} from "lucide-react";
import { userApi, adsApi, messagesApi } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface UserAd {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  status: "ACTIVE" | "SOLD" | "PAUSED";
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
    type: "AD_CREATED" | "AD_SOLD" | "AD_FAVORITED" | "MESSAGE_RECEIVED";
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

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user, isAuthenticated, isLoading: authIsLoading, logout, updateUser } =
    useAuth();
  const [activeTab, setActiveTab] = useState("aktivitet");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });

  // new state for public profile
  const [profileUser, setProfileUser] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setEditForm({
        displayName: user.displayName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const isOwnProfile = !username || (user && username === user.username);

  // fetch dashboard for own profile
  useEffect(() => {
    if (isOwnProfile) {
      const fetchDashboard = async () => {
        try {
          setIsLoading(true);
          const data = await adsApi.getDashboardData();
          setDashboardData(data);
        } catch (error) {
          console.error("Failed to fetch dashboard:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDashboard();
    }
  }, [isOwnProfile]);

  // fetch public profile for other users
  useEffect(() => {
    const fetchProfile = async () => {
      if (isOwnProfile || !username) return;
      try {
        setProfileLoading(true);
        const data = await userApi.getUserProfile(username);
        setProfileUser(data);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setProfileUser(null);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [username, user, isOwnProfile]);

  // Load conversations when messages tab is active
  useEffect(() => {
    if (activeTab === "meddelanden" && isOwnProfile) {
      loadConversations();
    }
  }, [activeTab, isOwnProfile]);

  const loadConversations = async () => {
    try {
      const response = await messagesApi.getConversations();
      setConversations(response.conversations || []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const response = await messagesApi.getMessages(conversationId);
      setMessages(response.messages || []);
      setSelectedConversation(conversationId);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      const updateData = {
        displayName: editForm.displayName,
        phone: editForm.phone || undefined,
        location: editForm.location || undefined,
        bio: editForm.bio || undefined,
      };

      const response = await userApi.updateProfile(updateData);

      if (response.user) {
        updateUser({
          displayName: response.user.displayName,
          phone: response.user.phone,
          location: response.user.location,
          bio: response.user.bio,
        });
      }

      setIsEditing(false);
    } catch (error: any) {
      console.error("Failed to save profile:", error);
      setSaveError(error.response?.data?.error || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await userApi.deleteAccount();
      logout();
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      alert(
        "Failed to delete account: " +
          (error.response?.data?.error || "Unknown error")
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      displayName: user?.displayName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      bio: user?.bio || "",
    });
    setSaveError(null);
    setIsEditing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "SOLD":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "PAUSED":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Aktiv";
      case "SOLD":
        return "Såld";
      case "PAUSED":
        return "Pausad";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "SOLD":
        return "bg-blue-100 text-blue-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("sv-SE");
  };

  // ConversationView Component for sending messages
  const ConversationView: React.FC<{
    conversationId: string;
    messages: any[];
    onMessageSent: (message: any) => void;
  }> = ({ conversationId, messages, onMessageSent }) => {
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
      if (!newMessage.trim()) return;
      setIsSending(true);
      try {
        const res = await messagesApi.sendMessageInConversation(
          conversationId,
          newMessage.trim()
        );
        setNewMessage("");
        onMessageSent(res.message);
      } catch (err: any) {
        toast.error(err.message || "Kunde inte skicka meddelandet");
      } finally {
        setIsSending(false);
      }
    };

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Inga meddelanden i denna konversation än</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.fromUserId === user?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.fromUserId === user?.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.fromUserId === user?.id
                        ? "text-blue-200"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(message.sentAt).toLocaleString("sv-SE", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t p-3 bg-white">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Skriv ett meddelande..."
            rows={2}
            disabled={isSending}
          />
          <div className="flex justify-end mt-2">
            <Button onClick={handleSend} disabled={isSending || !newMessage.trim()}>
              Skicka
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Show loading screen while auth is initializing
  if (authIsLoading && isOwnProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">
                Laddar profil...
              </h2>
              <p className="text-gray-600">Väntar på inloggningsdata</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && isOwnProfile && !authIsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Logga in för att se din profil
              </h2>
              <p className="text-gray-600">
                Logga in för att se och redigera din profil, kontaktinformation
                och inställningar.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- PUBLIC PROFILE VIEW ---
  if (!isOwnProfile) {
    if (profileLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p>Laddar användarprofil...</p>
        </div>
      );
    }

    if (!profileUser) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p>Kunde inte hitta användaren.</p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileUser.avatarUrl} />
                  <AvatarFallback>
                    {profileUser.displayName?.[0] ||
                      profileUser.username?.[0] ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileUser.displayName || profileUser.username}
                  </h1>
                  <p className="text-gray-600">{profileUser.bio}</p>
                  <p className="text-gray-500">{profileUser.location}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h2 className="text-lg font-semibold mb-2">Annonser</h2>
                {profileUser.ads && profileUser.ads.length > 0 ? (
                  <div className="space-y-3">
                    {profileUser.ads.map((ad: any) => (
                      <Link
                        key={ad.id}
                        to={`/annonser/${ad.id}`}
                        className="block border p-4 rounded-lg hover:shadow-md transition"
                      >
                        <h3 className="font-medium">{ad.title}</h3>
                        <p className="text-sm text-gray-600">{ad.description}</p>
                        <p className="text-sm font-semibold text-blue-600">
                          {formatPrice(ad.price)}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Inga annonser ännu.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- OWN PROFILE VIEW (your original implementation) ---
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
                    {editForm.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {editForm.displayName}
                  </h1>
                  <p className="text-gray-600">{editForm.bio}</p>
                </div>
              </div>

              {isOwnProfile && (
                <Button
                  onClick={logout}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" /> Logga ut
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="aktivitet" className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> Aktivitet
            </TabsTrigger>
            <TabsTrigger value="meddelanden" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> Meddelanden
            </TabsTrigger>
            <TabsTrigger value="installningar" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Inställningar
            </TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="aktivitet" className="mt-6">
            {isLoading ? (
              <p>Laddar dashboard...</p>
            ) : dashboardData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User's Ads */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" /> Mina annonser
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
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {dashboardData.userAds.map((ad) => (
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
                                  <Eye className="h-4 w-4" /> {ad.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" /> {ad.favorites}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Favorited Ads */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" /> Favoriter
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.favoriteAds.length === 0 ? (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Inga favoriter än</p>
                        <p className="text-sm text-gray-500">Annonser du gillar visas här</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {dashboardData.favoriteAds.map((ad) => (
                          <Link
                            key={ad.id}
                            to={`/annonser/${ad.id}`}
                            className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(ad.status)}
                                <Badge className={getStatusColor(ad.status)}>
                                  {getStatusLabel(ad.status)}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ad.description}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold text-blue-600">{formatPrice(ad.price)}</span>
                              <div className="flex items-center gap-4 text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" /> {ad.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" /> {ad.favorites}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p>Misslyckades att ladda dashboard.</p>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="meddelanden" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
              {/* Conversations List */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Konversationer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[500px] overflow-y-auto">
                      {conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Inga meddelanden än</p>
                          <p className="text-sm">Dina konversationer visas här</p>
                        </div>
                      ) : (
                        conversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            onClick={() => loadMessages(conversation.id)}
                            className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10 flex-shrink-0">
                                <AvatarImage src={conversation.otherUser.avatarUrl} />
                                <AvatarFallback>
                                  {conversation.otherUser.displayName?.[0] || conversation.otherUser.username?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-gray-900 truncate">
                                    {conversation.otherUser.displayName || conversation.otherUser.username}
                                  </p>
                                  <span className="text-xs text-gray-500 flex-shrink-0">
                                    {new Date(conversation.lastMessageAt).toLocaleDateString('sv-SE')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 truncate">
                                  {conversation.ad.title}
                                </p>
                                {conversation.lastMessage && (
                                  <p className="text-sm text-gray-500 truncate mt-1">
                                    {conversation.lastMessage.content}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Messages View */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>
                      {selectedConversation 
                        ? conversations.find(c => c.id === selectedConversation)?.ad.title || 'Meddelanden'
                        : 'Välj en konversation'
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[500px] flex flex-col">
                    {!selectedConversation ? (
                      <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <p>Välj en konversation för att visa meddelanden</p>
                        </div>
                      </div>
                    ) : loadingMessages ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                          <p className="text-gray-500">Laddar meddelanden...</p>
                        </div>
                      </div>
                    ) : (
                      <ConversationView 
                        conversationId={selectedConversation}
                        messages={messages}
                        onMessageSent={(message) => setMessages((prev) => [...prev, message])}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
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