import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface GoogleSignInProps {
  className?: string;
}


const GoogleSignIn: React.FC<GoogleSignInProps> = ({ className = '' }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Google Sign-In when component mounts
    const initializeGoogleSignIn = () => {
      if (typeof window === 'undefined' || !window.google) {
        return;
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        console.warn('Google Client ID not found in environment variables');
        return;
      }

      if (!googleButtonRef.current) {
        return;
      }

      try {
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
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
      }
    };

    // Check if Google script is already loaded
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for Google script to load
      const checkGoogleLoaded = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogleLoaded);
          initializeGoogleSignIn();
        }
      }, 100);

      // Clean up interval after 10 seconds
      setTimeout(() => clearInterval(checkGoogleLoaded), 10000);
    }
  }, []);

  const handleGoogleResponse = async (response: any) => {
    setIsLoading(true);
    try {
      const result = await authApi.googleLogin(response.credential);
      
      // Successful login
      login(result.token, result.user);
      toast.success('Successfully signed in!');
      
      // Redirect to intended destination or profile
      const redirectTo = searchParams.get('redirect') ||
                        (location.pathname === '/logga-in' ? '/skapa-annons' : '/profile');
      navigate(redirectTo);
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error(error.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      {/* Google Sign-In Button */}
      <div 
        ref={googleButtonRef} 
        className={`inline-block ${className}`}
      />


    </>
  );
};

export default GoogleSignIn; 