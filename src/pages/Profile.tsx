import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Mail, MapPin, Calendar, Code, Heart } from "lucide-react";

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { user, isAuthenticated } = useAuth();

  // Determine which profile to show
  const isOwnProfile = !username || (user && username === user.username);
  const displayUser = isOwnProfile ? user : null;

  // Placeholder user data for demonstration
  const placeholderUser = {
    username: username || "example-user",
    displayName: username ? `${username.charAt(0).toUpperCase()}${username.slice(1)} Developer` : "Your Profile",
    email: "example@goodhub.dev",
    avatarUrl: "",
    skills: ["JavaScript", "React", "Node.js", "Python", "Open Source"],
    githubUsername: username || "example-user",
    location: "Global",
    joinedDate: "2024-01-15",
    bio: "Passionate developer contributing to projects that make a positive impact on the world."
  };

  const profileData = displayUser || placeholderUser;

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isAuthenticated && isOwnProfile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">Your Profile</h1>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-green-400">Sign In to View Your Profile</h2>
            <p className="text-gray-400 mb-6">
              Once you sign in, you'll be able to view and edit your profile, showcase your skills, 
              and connect with other contributors in the GoodHub community.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-left">
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-2">Showcase Skills</h3>
                <p className="text-gray-400 text-sm">Display your technical expertise and interests</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-2">Track Contributions</h3>
                <p className="text-gray-400 text-sm">See your impact across all projects</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="font-semibold text-green-400 mb-2">Connect & Collaborate</h3>
                <p className="text-gray-400 text-sm">Build your network of changemakers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.avatarUrl} alt={profileData.displayName} />
                <AvatarFallback className="bg-green-600 text-white text-xl">
                  {getUserInitials(profileData.displayName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{profileData.displayName}</h1>
                <p className="text-green-400 text-lg mb-4">@{profileData.username}</p>
                
                {profileData.bio && (
                  <p className="text-gray-300 mb-4">{profileData.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-gray-400">
                  {profileData.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Joined {new Date(profileData.joinedDate).toLocaleDateString()}</span>
                  </div>
                  {profileData.githubUsername && (
                    <div className="flex items-center">
                      <Github className="h-4 w-4 mr-1" />
                      <span>@{profileData.githubUsername}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {isOwnProfile && isAuthenticated && (
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills & Expertise */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Code className="h-5 w-5 mr-2 text-green-400" />
              Skills & Expertise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profileData.skills?.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-200">
                  {skill}
                </Badge>
              )) || (
                <p className="text-gray-400">No skills listed yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Projects & Contributions */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Heart className="h-5 w-5 mr-2 text-green-400" />
              Projects & Contributions
            </CardTitle>
            <CardDescription className="text-gray-400">
              Project participation and contribution history coming soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-1">—</div>
                  <div className="text-gray-400">Projects Joined</div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-1">—</div>
                  <div className="text-gray-400">Contributions Made</div>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400 mb-1">—</div>
                  <div className="text-gray-400">Impact Score</div>
                </div>
              </div>
              <p className="text-gray-500 mt-4">
                Detailed project history and contribution tracking will be available soon
              </p>
            </div>
          </CardContent>
        </Card>

        {!isAuthenticated && (
          <div className="text-center">
            <p className="text-gray-400">
              This is a preview of profile pages on GoodHub. Sign in to see your full profile and start contributing!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 