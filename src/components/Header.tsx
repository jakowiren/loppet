import { Link, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import GoogleSignIn from "./GoogleSignIn";
import { LogOut, User, LayoutDashboard } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const getActiveTab = () => {
    if (location.pathname === '/profile') return 'profile';
    if (location.pathname === '/projects') return 'projects';
    return 'home';
  };

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (displayName: string) => {
    return displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Navigation Tabs */}
          <Tabs value={getActiveTab()} className="flex">
            <TabsList className="bg-gray-800 border border-gray-700">
              <Link to="/">
                <TabsTrigger 
                  value="home" 
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-green-400 text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </TabsTrigger>
              </Link>
              <Link to="/profile">
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-green-400 text-gray-300 hover:text-white transition-colors"
                >
                  Profile
                </TabsTrigger>
              </Link>
              <Link to="/projects">
                <TabsTrigger 
                  value="projects" 
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-green-400 text-gray-300 hover:text-white transition-colors"
                >
                  Projects
                </TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                {/* Dashboard Link for authenticated users */}
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                        <AvatarFallback className="bg-green-600 text-white">
                          {getUserInitials(user.displayName)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end">
                    <div className="px-2 py-1.5 text-sm text-gray-300">
                      <div className="font-medium">{user.displayName}</div>
                      <div className="text-xs text-gray-400">@{user.username}</div>
                    </div>
                    <DropdownMenuItem asChild className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                      <Link to={`/profile/${user.username}`}>
                        <User className="mr-2 h-4 w-4" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Sign In Button for unauthenticated users */
              <GoogleSignIn />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 