import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Users, Github, ExternalLink, Search, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { projectApi } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  githubUrl?: string;
  impactDescription: string;
  createdAt: string;
  creator: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  _count: {
    members: number;
  };
  isJoined: boolean;
}

const Projects = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    loadProjects();
    loadCategories();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.query = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      
      const response = await projectApi.getProjects(params);
      setProjects(response.projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await projectApi.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSearch = () => {
    loadProjects();
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Discover Good Projects</h1>
          {isAuthenticated && (
            <Button 
              onClick={() => navigate('/create-project')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleSearch} variant="outline" className="border-gray-600">
            Search
          </Button>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No projects found</p>
            {isAuthenticated && (
              <Button 
                onClick={() => navigate('/create-project')}
                className="bg-green-600 hover:bg-green-700"
              >
                Create the First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      {formatCategory(project.category)}
                    </Badge>
                    <Heart className="h-5 w-5 text-gray-400 hover:text-red-400 cursor-pointer" />
                  </div>
                  <CardTitle className="text-white text-xl">
                    <Link to={`/projects/${project.id}`} className="hover:text-green-400">
                      {project.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {project.description.length > 150 
                      ? `${project.description.substring(0, 150)}...` 
                      : project.description
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary" className="bg-gray-700 text-gray-200">
                          {tech}
                        </Badge>
                      ))}
                      {project.techStack.length > 3 && (
                        <Badge variant="secondary" className="bg-gray-700 text-gray-200">
                          +{project.techStack.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{project._count.members} members</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {project.githubUrl && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            onClick={() => window.open(project.githubUrl, '_blank')}
                          >
                            <Github className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          className={project.isJoined 
                            ? "bg-gray-600 hover:bg-gray-700" 
                            : "bg-green-600 hover:bg-green-700"
                          }
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          {project.isJoined ? "Joined" : "View"}
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
                      By {project.creator.displayName} • {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects; 