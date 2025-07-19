import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Github, Plus, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// Placeholder data to prevent crashes
const PLACEHOLDER_PROJECTS = [
  {
    id: "1",
    title: "Open Source Climate Tracker",
    description: "A web application that helps track and visualize climate data from various sources to promote environmental awareness.",
    category: "ENVIRONMENTAL",
    techStack: ["React", "Node.js", "PostgreSQL", "D3.js"],
    githubUrl: "https://github.com/example/climate-tracker",
    memberCount: 12,
    creatorName: "Jane Smith",
    createdAt: "2024-01-15"
  },
  {
    id: "2", 
    title: "Community Food Share Network",
    description: "Platform connecting local food producers with community members to reduce waste and increase food accessibility.",
    category: "SOCIAL_IMPACT",
    techStack: ["Vue.js", "Python", "Django", "MongoDB"],
    memberCount: 8,
    creatorName: "Alex Chen",
    createdAt: "2024-02-10"
  },
  {
    id: "3",
    title: "Digital Literacy for Seniors",
    description: "Educational platform with tutorials and resources to help senior citizens learn essential digital skills.",
    category: "EDUCATION",
    techStack: ["Next.js", "TypeScript", "Supabase"],
    memberCount: 5,
    creatorName: "Maria Garcia",
    createdAt: "2024-01-28"
  }
];

const Projects = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

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

        {/* Coming Soon Notice */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Search className="h-5 w-5 text-green-400 mr-2" />
            <h2 className="text-xl font-semibold text-green-400">Project Discovery Coming Soon</h2>
          </div>
          <p className="text-gray-300 mb-4">
            We're building a powerful project discovery platform with search, filtering, and collaboration features. 
            Here's a preview of what's coming:
          </p>
          <ul className="text-gray-400 space-y-2">
            <li>• Advanced search and category filtering</li>
            <li>• Project collaboration and team joining</li>
            <li>• Impact tracking and metrics</li>
            <li>• GitHub integration</li>
          </ul>
        </div>
        
        {/* Preview Projects */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-300">Preview: Sample Good Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLACEHOLDER_PROJECTS.map((project) => (
              <Card key={project.id} className="bg-gray-800 border-gray-700 opacity-75">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      {formatCategory(project.category)}
                    </Badge>
                    <Heart className="h-5 w-5 text-gray-500" />
                  </div>
                  <CardTitle className="text-white text-xl">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {project.description}
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
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{project.memberCount} members</span>
                      </div>
                      
                      <div className="flex gap-2">
                        {project.githubUrl && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-gray-600 text-gray-400"
                            disabled
                          >
                            <Github className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          className="bg-gray-600 hover:bg-gray-600"
                          disabled
                        >
                          View
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
                      By {project.creatorName} • {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400 mb-4">Ready to make an impact?</p>
          {isAuthenticated ? (
            <Button 
              onClick={() => navigate('/create-project')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          ) : (
            <p className="text-gray-500">Sign in to start creating projects</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects; 