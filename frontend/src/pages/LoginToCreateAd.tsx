import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import GoogleSignIn from '@/components/GoogleSignIn';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Lock } from 'lucide-react';

const LoginToCreateAd = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/skapa-annons');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen relative">
      {/* Video background */}
      <video
        src="/background-compressed.mp4"
        poster="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-blue-800/50 to-blue-700/60 z-10"></div>
      
      <div className="relative z-20 min-h-screen flex items-center justify-center py-8 px-4">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Skapa annons
              </h1>
              <p className="text-gray-600 mb-6">
                Logga in för att kunna skapa en annons och sälja din lopputrustning
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 text-blue-800">
                <Lock className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">
                  Du måste vara inloggad för att skapa annonser
                </p>
              </div>
            </div>
            
            <div className="w-full">
              <GoogleSignIn />
            </div>
            
            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              Genom att logga in godkänner du våra villkor och kommer direkt till sidan för att skapa din annons.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginToCreateAd;