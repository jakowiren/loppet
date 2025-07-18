import { Link, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Header = () => {
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname === '/profile') return 'profile';
    if (location.pathname === '/projects') return 'projects';
    return 'home';
  };

  return (
    <header className="w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
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
        </div>
      </div>
    </header>
  );
};

export default Header; 