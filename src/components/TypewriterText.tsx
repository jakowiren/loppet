import { useState, useEffect } from 'react';
import { useAnimationLoop } from '../hooks/useAnimationLoop';

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  loop?: boolean;
  loopDelay?: number;
  startTime?: number;
  duration?: number;
}

const TypewriterText = ({ 
  text, 
  delay = 0, 
  speed = 50, 
  className = "",
  loop = false,
  loopDelay = 10000,
  startTime = 0,
  duration = 5000
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [hasStartedAnimation, setHasStartedAnimation] = useState(false);
  const [hasCompletedAnimation, setHasCompletedAnimation] = useState(false);
  const loopState = useAnimationLoop(30000);
  
  const animateText = () => {
    if (hasStartedAnimation) return;
    
    setHasStartedAnimation(true);
    setDisplayedText('');
    setIsVisible(true);
    let currentIndex = 0;
    
    const timer = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(timer);
        setHasCompletedAnimation(true);
      }
    }, speed);
    
    return timer;
  };

  useEffect(() => {
    if (!loop) {
      // Non-loop behavior (original)
      const startTimer = setTimeout(() => {
        setIsVisible(true);
        animateText();
      }, delay);
      
      return () => clearTimeout(startTimer);
    }

    // Loop behavior with shared timing
    if (!loopState.isActive) return;

    // Reset at start of each cycle, but with a small delay to sync with contribution board
    if (loopState.timeInCycle < 200) {
      setDisplayedText('');
      setIsVisible(false);
      setHasStartedAnimation(false);
      setHasCompletedAnimation(false);
    }
    
    // Check if we should start animation
    if (loopState.timeInCycle >= startTime && loopState.timeInCycle <= startTime + duration) {
      if (!hasStartedAnimation) {
        animateText();
      }
    }
    
    // Keep text visible after animation completes until reset
    if (hasCompletedAnimation && loopState.timeInCycle >= 200) {
      setIsVisible(true);
    }
  }, [text, speed, delay, loop, loopState, startTime, duration, hasStartedAnimation, hasCompletedAnimation]);
  
  return (
    <div className={className} style={{ minHeight: '1em' }}>
      <span className="inline-block">
        {isVisible ? displayedText : ''}
      </span>
      {isVisible && displayedText.length < text.length && hasStartedAnimation && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  );
};

export default TypewriterText;
