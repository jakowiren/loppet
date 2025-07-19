import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Github, ExternalLink, Users, Calendar, UserPlus, UserMinus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { projectApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProjectMember {
  id: string;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    skills: string[];
    githubUsername?: string;
  };
}

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  githubUrl?: string;
  impactDescription: string;
  createdAt: string;
  creator: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    githubUsername?: string;
  };
  members: ProjectMember[];
  isJoined: boolean;
  isOwner: boolean;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getProject(id!);
      setProject(response.project);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive"
      });
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join projects",
        variant: "destructive"
      });
      return;
    }

    try {
      setActionLoading(true);
      
      if (project?.isJoined) {
        await projectApi.leaveProject(id!);
        toast({
          title: "Success",
          description: "You have left the project"
        });
      } else {
        await projectApi.joinProject(id!);
        toast({
          title: "Success",
          description: "You have joined the project!"
        });
      }
      
      // Reload project to update member list
      await loadProject();
    } catch (error: any) {
      console.error('Failed to join/leave project:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update membership",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatCategory = (category: string) => {
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading project...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Project not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/projects')}
          className="mb-6 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>

        <div className="space-y-6">
          {/* Project Header */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      {formatCategory(project.category)}
                    </Badge>
                    <span className="text-gray-400 text-sm">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-3xl text-white">{project.title}</CardTitle>
                </div>
                
                <div className="flex items-center gap-2">
                  {project.githubUrl && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(project.githubUrl, '_blank')}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  )}
                  
                  {isAuthenticated && !project.isOwner && (
                    <Button 
                      onClick={handleJoinLeave}
                      disabled={actionLoading}
                      className={project.isJoined 
                        ? "bg-red-600 hover:bg-red-700" 
                        : "bg-green-600 hover:bg-green-700"
                      }
                    >
                      {actionLoading ? (
                        "Loading..."
                      ) : project.isJoined ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Leave Project
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Join Project
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Project Details */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {project.description}
                  </p>
                </CardContent>
              </Card>

              {/* Impact */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Impact & Purpose</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {project.impactDescription}
                  </p>
                </CardContent>
              </Card>

              {/* Technology Stack */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Technology Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="bg-gray-700 text-gray-200">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Project Owner */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Project Creator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={project.creator.avatarUrl} />
                      <AvatarFallback className="bg-gray-700">
                        {project.creator.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">{project.creator.displayName}</p>
                      <p className="text-gray-400 text-sm">@{project.creator.username}</p>
                      {project.creator.githubUsername && (
                        <a 
                          href={`https://github.com/${project.creator.githubUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 text-sm hover:underline"
                        >
                          GitHub Profile
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Team Members ({project.members.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.members.length === 0 ? (
                      <p className="text-gray-400 text-sm">No members yet. Be the first to join!</p>
                    ) : (
                      project.members.map((member) => (
                        <div key={member.id} className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.user.avatarUrl} />
                            <AvatarFallback className="bg-gray-700 text-xs">
                              {member.user.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {member.user.displayName}
                            </p>
                            <p className="text-gray-400 text-xs">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;