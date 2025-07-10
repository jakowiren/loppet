
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
  const loopState = useAnimationLoop(30000);
  
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
        }
      }, speed);
      
      return timer;
    };

    // Reset text at start of each cycle
    if (loopState.timeInCycle < 100) {
      setDisplayedText('');
      setIsVisible(false);
    }
    
    // Check if we should start animation
    if (loopState.timeInCycle >= startTime && loopState.timeInCycle <= startTime + duration) {
      if (!isVisible) {
        animateText();
      }
    } else {
      // Hide text outside of our time window
      setIsVisible(false);
      setDisplayedText('');
    }
  }, [text, speed, delay, loop, loopState, startTime, duration]);
  
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
