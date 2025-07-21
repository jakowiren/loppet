import { Link, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import GoogleSignIn from "./GoogleSignIn";
import { LogOut, User, LayoutDashboard, Plus, Activity } from "lucide-react";

// Custom Logo Component
const LoppetLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
    {/* Background circle */}
    <circle cx="16" cy="16" r="16" fill="#1e40af"/>
    
    {/* Running figure */}
    <path d="M8 20c0-2 1-3.5 2.5-4.5s3-1.5 4.5-1.5 3 0.5 4.5 1.5S22 18 22 20s-1 3.5-2.5 4.5-3 1.5-4.5 1.5-3-0.5-4.5-1.5S8 22 8 20z" fill="#fbbf24"/>
    
    {/* Speed lines */}
    <path d="M24 8l2 2-2 2" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M26 12l2 2-2 2" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M28 16l2 2-2 2" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Finish line */}
    <rect x="6" y="6" width="2" height="20" fill="#fbbf24"/>
    <rect x="8" y="6" width="2" height="20" fill="#1e40af"/>
    <rect x="10" y="6" width="2" height="20" fill="#fbbf24"/>
    <rect x="12" y="6" width="2" height="20" fill="#1e40af"/>
  </svg>
);

const Header = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const getActiveTab = () => {
    if (location.pathname.startsWith('/profile')) return 'profile';
    if (location.pathname === '/annonser' || location.pathname.startsWith('/annonser')) return 'annonser';
    if (location.pathname === '/skapa-annons') return 'skapa-annons';
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
    <header className="w-full bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 backdrop-blur-md border-b border-blue-700/30 sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-200">
                <LoppetLogo />
                <h1 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-200">Loppet</h1>
              </div>
            </Link>
            <span className="text-sm text-blue-200 hidden sm:block font-medium">Svenska loppmarknaden</span>
          </div>

          {/* Navigation Tabs - Updated to include all three buttons */}
          <Tabs value={getActiveTab()} className="flex">
            <TabsList className="bg-blue-800/50 border border-blue-600/50 backdrop-blur-sm rounded-lg p-1">
              <Link to="/">
                <TabsTrigger 
                  value="home" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-yellow-400 text-blue-200 hover:text-white hover:bg-blue-700/50 transition-all duration-200 rounded-md px-4 py-2 font-medium"
                >
                  Hem
                </TabsTrigger>
              </Link>
              <Link to="/annonser">
                <TabsTrigger 
                  value="annonser" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-yellow-400 text-blue-200 hover:text-white hover:bg-blue-700/50 transition-all duration-200 rounded-md px-4 py-2 font-medium"
                >
                  Annonser
                </TabsTrigger>
              </Link>
              <Link to="/skapa-annons">
                <TabsTrigger 
                  value="skapa-annons" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-yellow-400 text-blue-200 hover:text-white hover:bg-blue-700/50 transition-all duration-200 rounded-md px-4 py-2 font-medium"
                >
                  Skapa annons
                </TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* User Profile - Direct Link */}
                <Link to={`/profile/${user.username}`}>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-blue-700/50 transition-all duration-200 border border-blue-600/30">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-600/30">
                      <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium">
                        {getUserInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </Link>
              </>
            ) : (
              /* Sign In Button for unauthenticated users - improved styling */
              <div className="bg-blue-800/50 border border-blue-600/50 backdrop-blur-sm rounded-lg p-1">
                <GoogleSignIn className="[&>div]:rounded-md [&>div]:border-0 [&>div]:bg-transparent [&>div]:p-0 [&>div]:hover:bg-blue-700/50 [&>div]:transition-all [&>div]:duration-200" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 