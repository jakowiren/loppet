
import { useState, useEffect } from 'react';

interface AnimationLoopState {
  currentCycle: number;
  timeInCycle: number;
  isActive: boolean;
}

export const useAnimationLoop = (cycleDuration: number = 30000) => {
  const [loopState, setLoopState] = useState<AnimationLoopState>({
    currentCycle: 0,
    timeInCycle: 0,
    isActive: false
  });

  useEffect(() => {
    // Start the loop after initial delay
    const startTimer = setTimeout(() => {
      setLoopState(prev => ({ ...prev, isActive: true }));
    }, 500);

    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!loopState.isActive) return;

    const startTime = Date.now();
    let animationFrame: number;

    const updateLoop = () => {
      const elapsed = Date.now() - startTime;
      const currentCycle = Math.floor(elapsed / cycleDuration);
      const timeInCycle = elapsed % cycleDuration;

      setLoopState(prev => ({
        ...prev,
        currentCycle,
        timeInCycle
      }));

      animationFrame = requestAnimationFrame(updateLoop);
    };

    animationFrame = requestAnimationFrame(updateLoop);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [loopState.isActive, cycleDuration]);

  return loopState;
};
