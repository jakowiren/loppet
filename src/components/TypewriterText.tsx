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
  const [hasAnimated, setHasAnimated] = useState(false);
  const loopState = useAnimationLoop(30000);
  
  const animateText = () => {
    setDisplayedText('');
    setIsVisible(true);
    let currentIndex = 0;
    
    const timer = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(timer);
        setHasAnimated(true);
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

    // Reset at start of each cycle
    if (loopState.timeInCycle < 100) {
      setDisplayedText('');
      setIsVisible(false);
      setHasAnimated(false);
    }
    
    // Check if we should start animation
    if (loopState.timeInCycle >= startTime && loopState.timeInCycle <= startTime + duration) {
      if (!hasAnimated) {
        animateText();
      }
    }
    
    // Keep text visible after animation completes until loop restarts
    if (hasAnimated && loopState.timeInCycle > startTime + duration) {
      setIsVisible(true);
    }
  }, [text, speed, delay, loop, loopState, startTime, duration, hasAnimated]);
  
  return (
    <div className={className} style={{ minHeight: '1em' }}>
      <span className="inline-block">
        {isVisible ? displayedText : ''}
      </span>
      {isVisible && displayedText.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  );
};

export default TypewriterText;
