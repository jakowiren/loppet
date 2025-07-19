import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';

interface GoogleSignInProps {
  className?: string;
}

interface NewUserData {
  username: string;
  skills: string[];
  githubUsername: string;
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({ className = '' }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [googleToken, setGoogleToken] = useState<string>('');
  const [newUserData, setNewUserData] = useState<NewUserData>({
    username: '',
    skills: [],
    githubUsername: ''
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Google Sign-In when component mounts
    if (typeof window !== 'undefined' && window.google && googleButtonRef.current) {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render the working Google button
      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        { 
          theme: 'outline', 
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          width: 250
        }
      );
    }
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setIsLoading(true);
    try {
      const result = await authApi.googleLogin(response.credential);
      
      // Successful login
      login(result.token, result.user);
      toast.success('Successfully signed in!');
      
      // Redirect to intended destination or dashboard
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo);
    } catch (error: any) {
      console.error('Google auth error:', error);
      
      // Check if new user needs to provide username
      if (error.response?.data?.needsUsername) {
        setGoogleToken(response.credential);
        setShowNewUserModal(true);
      } else {
        toast.error(error.response?.data?.error || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewUserSubmit = async () => {
    if (!newUserData.username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (newUserData.username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.googleLogin(googleToken, {
        username: newUserData.username,
        skills: newUserData.skills,
        githubUsername: newUserData.githubUsername || undefined
      });

      login(result.token, result.user);
      toast.success('Account created successfully!');
      setShowNewUserModal(false);
      resetNewUserData();
      
      // Redirect to intended destination or dashboard
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      navigate(redirectTo);
    } catch (error: any) {
      console.error('New user creation error:', error);
      toast.error(error.response?.data?.error || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const resetNewUserData = () => {
    setNewUserData({
      username: '',
      skills: [],
      githubUsername: ''
    });
    setCurrentSkill('');
    setGoogleToken('');
  };

  const addSkill = () => {
    if (currentSkill.trim() && newUserData.skills.length < 20) {
      setNewUserData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setNewUserData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <>
      {/* Google Sign-In Button */}
      <div 
        ref={googleButtonRef} 
        className={`inline-block ${className}`}
      />

      {isLoading && (
        <div className="flex items-center justify-center mt-2">
          <Loader2 className="h-4 w-4 animate-spin text-green-400 mr-2" />
          <span className="text-gray-400 text-sm">Signing in...</span>
        </div>
      )}

      <Dialog open={showNewUserModal} onOpenChange={setShowNewUserModal}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Complete Your Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-300">
                Username *
              </Label>
              <Input
                id="username"
                value={newUserData.username}
                onChange={(e) => setNewUserData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
                className="bg-gray-700 border-gray-600 text-white"
                maxLength={50}
              />
            </div>

            <div>
              <Label htmlFor="githubUsername" className="text-gray-300">
                GitHub Username (optional)
              </Label>
              <Input
                id="githubUsername"
                value={newUserData.githubUsername}
                onChange={(e) => setNewUserData(prev => ({ ...prev, githubUsername: e.target.value }))}
                placeholder="Enter GitHub username"
                className="bg-gray-700 border-gray-600 text-white"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="skills" className="text-gray-300">
                Skills (optional, max 20)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={handleSkillKeyPress}
                  placeholder="Add a skill and press Enter"
                  className="bg-gray-700 border-gray-600 text-white"
                  disabled={newUserData.skills.length >= 20}
                />
                <Button 
                  type="button" 
                  onClick={addSkill}
                  disabled={!currentSkill.trim() || newUserData.skills.length >= 20}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add
                </Button>
              </div>
              
              {newUserData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newUserData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-300">
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  setShowNewUserModal(false);
                  resetNewUserData();
                }}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleNewUserSubmit}
                disabled={isLoading || !newUserData.username.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoogleSignIn; 