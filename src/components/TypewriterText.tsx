
import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  loop?: boolean;
  loopDelay?: number;
}

const TypewriterText = ({ 
  text, 
  delay = 0, 
  speed = 50, 
  className = "",
  loop = false,
  loopDelay = 10000
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsStarted(true);
    }, delay);
    
    return () => clearTimeout(startTimer);
  }, [delay]);
  
  useEffect(() => {
    if (!isStarted) return;
    
    const animateText = () => {
      setDisplayedText(''); // Reset text
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
    
    // Start first animation
    const firstTimer = animateText();
    
    // Set up loop if enabled
    let loopInterval: NodeJS.Timeout | null = null;
    if (loop) {
      loopInterval = setInterval(() => {
        animateText();
      }, loopDelay);
    }
    
    return () => {
      clearInterval(firstTimer);
      if (loopInterval) clearInterval(loopInterval);
    };
  }, [text, speed, isStarted, loop, loopDelay]);
  
  return (
    <div className={className}>
      <span className="inline-block">
        {displayedText}
      </span>
      {isStarted && displayedText.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  );
};

export default TypewriterText;
