import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface VideoBackgroundProps {
  videoSources: Array<{ src: string; type: string }>;
  fallbackImage: string;
  className?: string;
  children?: React.ReactNode;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoSources,
  fallbackImage,
  className = '',
  children
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if user prefers reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' ? 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
  // Check if user is on a slow connection
  const isSlowConnection = typeof navigator !== 'undefined' && 'connection' in navigator && 
    ((navigator as any).connection?.effectiveType === 'slow-2g' || 
    (navigator as any).connection?.effectiveType === '2g');


  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleCanPlay = () => {
      setIsLoading(false);
      setCanPlay(true);
      // Try to play the video
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setUserInteracted(true);
            })
            .catch((playError) => {
              setUserInteracted(false);
            });
        }
      } catch (playError) {
        setUserInteracted(false);
      }
    };

    const handleError = (error?: Event) => {
      setIsLoading(false);
      setHasError(true);
      setCanPlay(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    // Handle user interaction for autoplay
    const handleFirstUserInteraction = () => {
      if (canPlay && !userInteracted && !hasError && video.paused) {
        try {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setUserInteracted(true);
              })
              .catch((playError) => {
                // Continue with fallback image
              });
          }
        } catch (error) {
          // Continue with fallback image
        }
      }
    };

    // Listen for any user interaction on the document
    document.addEventListener('click', handleFirstUserInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstUserInteraction, { once: true });
    document.addEventListener('keydown', handleFirstUserInteraction, { once: true });

    // Cleanup
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      document.removeEventListener('click', handleFirstUserInteraction);
      document.removeEventListener('touchstart', handleFirstUserInteraction);
      document.removeEventListener('keydown', handleFirstUserInteraction);
    };
  }, [canPlay, userInteracted, hasError]);


  // Don't load video if user prefers reduced motion or has slow connection
  const shouldLoadVideo = !prefersReducedMotion && !isSlowConnection && !hasError;
  // Only show video when it's fully ready to play smoothly
  const shouldShowVideo = shouldLoadVideo && canPlay && !isLoading;
  

  return (
    <div className={`relative ${className}`}>
      {/* Base background color to prevent flashes */}
      <div className="absolute inset-0 w-full h-full bg-blue-900" />
      
      {/* Video Element - only render when ready */}
      {shouldLoadVideo && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            shouldShowVideo && userInteracted ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onError={() => {
            setHasError(true);
          }}
        >
          {videoSources.map((source, index) => (
            <source key={index} src={source.src} type={source.type} />
          ))}
        </video>
      )}

      {/* Fallback Background Image */}
      <div 
        className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${
          shouldShowVideo && userInteracted ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: `url('${fallbackImage}')`,
        }}
      />

      {/* Loading Indicator */}
      {isLoading && shouldLoadVideo && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black/50 rounded-full p-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        </div>
      )}

      {/* User Interaction Prompt (only show if video can play but needs interaction) */}
      {shouldShowVideo && !userInteracted && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black/70 text-white px-6 py-3 rounded-lg text-center">
            <p className="text-sm">Klicka var som helst för att spela video</p>
          </div>
        </div>
      )}

      {/* Content Overlay */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};

export default VideoBackground;