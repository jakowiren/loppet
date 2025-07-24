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

  // Log initial state
  console.log('[VideoBackground] Initial render', {
    prefersReducedMotion,
    isSlowConnection,
    videoSources,
    fallbackImage
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      console.log('[VideoBackground] No video element found on mount');
      return;
    }

    const handleCanPlay = () => {
      console.log('[VideoBackground] canplay event fired');
      setIsLoading(false);
      setCanPlay(true);
      // Try to play the video
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('[VideoBackground] Video started playing successfully (autoplay)');
              setUserInteracted(true);
            })
            .catch((playError) => {
              console.log('[VideoBackground] Video autoplay prevented, waiting for user interaction:', playError.message);
              setUserInteracted(false);
            });
        }
      } catch (playError) {
        console.warn('[VideoBackground] Failed to play video:', playError);
        setUserInteracted(false);
      }
    };

    const handleError = (error?: Event) => {
      console.warn('[VideoBackground] Video background failed to load, falling back to image:', error);
      setIsLoading(false);
      setHasError(true);
      setCanPlay(false);
    };

    const handleLoadStart = () => {
      console.log('[VideoBackground] loadstart event fired');
      setIsLoading(true);
    };

    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    // Handle user interaction for autoplay
    const handleFirstUserInteraction = () => {
      console.log('[VideoBackground] User interaction detected');
      if (canPlay && !userInteracted && !hasError && video.paused) {
        try {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('[VideoBackground] Video started playing after user interaction');
                setUserInteracted(true);
              })
              .catch((playError) => {
                console.log('[VideoBackground] Video play failed after user interaction:', playError.message);
                // Continue with fallback image
              });
          }
        } catch (error) {
          console.warn('[VideoBackground] Failed to play video after user interaction:', error);
        }
      } else {
        console.log('[VideoBackground] User interaction ignored (canPlay:', canPlay, ', userInteracted:', userInteracted, ', hasError:', hasError, ', paused:', video.paused, ')');
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

  // Log state changes
  useEffect(() => {
    console.log('[VideoBackground] State update', {
      isLoading,
      hasError,
      canPlay,
      userInteracted
    });
  }, [isLoading, hasError, canPlay, userInteracted]);

  // Don't load video if user prefers reduced motion or has slow connection
  const shouldShowVideo = !prefersReducedMotion && !isSlowConnection && !hasError;
  console.log('[VideoBackground] Render', {
    shouldShowVideo,
    isLoading,
    hasError,
    canPlay,
    userInteracted
  });

  return (
    <div className={`relative ${className}`}>
      {/* Video Element */}
      {shouldShowVideo && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            canPlay && !isLoading && userInteracted ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onError={() => {
            console.log('[VideoBackground] onError prop fired');
            setHasError(true);
          }}
          onPlay={() => {
            console.log('[VideoBackground] onPlay event fired', {
              currentTime: videoRef.current?.currentTime,
              paused: videoRef.current?.paused
            });
          }}
          onPause={() => {
            console.log('[VideoBackground] onPause event fired', {
              currentTime: videoRef.current?.currentTime,
              paused: videoRef.current?.paused
            });
          }}
        >
          {videoSources.map((source, index) => (
            <source key={index} src={source.src} type={source.type} />
          ))}
        </video>
      )}

      {/* Fallback Background Image */}
      <div 
        className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          shouldShowVideo && canPlay && !isLoading && userInteracted ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: `url('${fallbackImage}')`,
        }}
      />

      {/* Loading Indicator */}
      {isLoading && shouldShowVideo && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black/50 rounded-full p-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        </div>
      )}

      {/* User Interaction Prompt (only show if video can play but needs interaction) */}
      {shouldShowVideo && canPlay && !userInteracted && !isLoading && (
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