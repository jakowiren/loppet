
import { useState, useEffect } from 'react';

const ContributionBoard = () => {
  const [filledCells, setFilledCells] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Generate a year's worth of squares (52 weeks * 7 days)
  const totalCells = 52 * 7;
  
  // Different contribution levels (GitHub style)
  const contributionLevels = [
    'bg-gray-800', // No contributions
    'bg-green-900', // Low
    'bg-green-700', // Medium-low  
    'bg-green-500', // Medium
    'bg-green-300', // High
  ];
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (!isAnimating) return;
    
    const animateContributions = () => {
      const totalDuration = 3000; // 3 seconds total animation
      const intervals = 50; // Number of animation steps
      const intervalTime = totalDuration / intervals;
      
      let currentStep = 0;
      
      const interval = setInterval(() => {
        const progress = currentStep / intervals;
        const targetCells = Math.floor(totalCells * 0.7 * progress); // Fill 70% of cells
        
        // Add some randomness to make it look organic
        const newFilledCells = new Set<number>();
        for (let i = 0; i < targetCells; i++) {
          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * totalCells);
          } while (newFilledCells.has(randomIndex));
          newFilledCells.add(randomIndex);
        }
        
        setFilledCells(newFilledCells);
        
        currentStep++;
        if (currentStep > intervals) {
          clearInterval(interval);
        }
      }, intervalTime);
      
      return () => clearInterval(interval);
    };
    
    const cleanup = animateContributions();
    return cleanup;
  }, [isAnimating, totalCells]);
  
  const getCellStyle = (index: number) => {
    if (!filledCells.has(index)) {
      return contributionLevels[0]; // Empty cell
    }
    
    // Randomly assign contribution levels for filled cells
    const level = Math.floor(Math.random() * 4) + 1;
    return contributionLevels[level];
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-gray-400 text-sm font-mono mb-4">
        {filledCells.size} contributions in the last year
      </h2>
      
      <div className="grid grid-cols-52 gap-1 p-4 bg-gray-800/30 rounded-lg backdrop-blur-sm">
        {Array.from({ length: totalCells }, (_, index) => (
          <div
            key={index}
            className={`w-2.5 h-2.5 rounded-sm transition-all duration-200 ${getCellStyle(index)}`}
            style={{
              animationDelay: `${(index / totalCells) * 2000}ms`
            }}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        <span>Less</span>
        {contributionLevels.map((level, index) => (
          <div key={index} className={`w-2.5 h-2.5 rounded-sm ${level}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default ContributionBoard;
