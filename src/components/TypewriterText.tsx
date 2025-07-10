
import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  loop?: boolean;
  loopDelay?: number;
  startTime?: number; // New prop for absolute start time within loop
  duration?: number; // New prop for animation duration
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
  
  useEffect(() => {
    if (!loop) {
      // Non-loop behavior (original)
      const startTimer = setTimeout(() => {
        setIsVisible(true);
        animateText();
      }, delay);
      
      return () => clearTimeout(startTimer);
    }

    // Loop behavior with absolute timing
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

    const runLoop = () => {
      // Clear text at start of each loop
      setDisplayedText('');
      setIsVisible(false);
      
      // Start animation at the specified time
      const startTimer = setTimeout(() => {
        animateText();
      }, startTime);
      
      // Hide text after animation duration
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setDisplayedText('');
      }, startTime + duration);
      
      return [startTimer, hideTimer];
    };

    // Run first loop immediately
    const initialTimers = runLoop();
    
    // Set up repeating loop
    const loopInterval = setInterval(() => {
      runLoop();
    }, loopDelay);
    
    return () => {
      initialTimers.forEach(timer => clearTimeout(timer));
      clearInterval(loopInterval);
    };
  }, [text, speed, delay, loop, loopDelay, startTime, duration]);
  
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
