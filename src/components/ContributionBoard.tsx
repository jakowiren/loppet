
import { useState, useEffect } from 'react';
import { useAnimationLoop } from '../hooks/useAnimationLoop';

const ContributionBoard = () => {
  const [filledCells, setFilledCells] = useState<Set<number>>(new Set());
  const loopState = useAnimationLoop(30000);
  
  // Generate a year's worth of squares (53 weeks * 7 days)
  const totalWeeks = 53;
  const daysPerWeek = 7;
  const totalCells = totalWeeks * daysPerWeek;
  
  // Different contribution levels (GitHub style)
  const contributionLevels = [
    'bg-gray-800', // No contributions
    'bg-green-900', // Low
    'bg-green-700', // Medium-low  
    'bg-green-500', // Medium
    'bg-green-300', // High
  ];
  
  // Month labels for the top of the grid
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  useEffect(() => {
    if (!loopState.isActive) return;
    
    const animateContributions = () => {
      const totalDuration = 15000; // 15 seconds for contributions animation
      const fillPercentage = 0.35; // Fill 35% of cells (65% will stay empty)
      const cellsToFill = Math.floor(totalCells * fillPercentage);
      
      // Create array of all possible cell indices
      const allCells = Array.from({ length: totalCells }, (_, i) => i);
      
      // Randomly select which cells to fill (ensuring 65% stay empty)
      const shuffledCells = allCells.sort(() => Math.random() - 0.5);
      const cellsToFillArray = shuffledCells.slice(0, cellsToFill);
      
      // Sort by position for left-to-right filling animation
      cellsToFillArray.sort((a, b) => a - b);
      
      // Animate cells filling in sequence over 15 seconds
      cellsToFillArray.forEach((cellIndex, index) => {
        const delay = (index / cellsToFillArray.length) * totalDuration;
        setTimeout(() => {
          setFilledCells(prev => new Set([...prev, cellIndex]));
        }, delay);
      });
    };
    
    // Reset at start of each cycle
    if (loopState.timeInCycle < 100) {
      setFilledCells(new Set());
      // Start animation immediately after reset
      setTimeout(() => {
        animateContributions();
      }, 100);
    }
  }, [loopState, totalCells]);
  
  const getCellStyle = (index: number) => {
    if (!filledCells.has(index)) {
      return contributionLevels[0]; // Empty cell (65% of all cells)
    }
    
    // Randomly assign contribution levels for filled cells
    const level = Math.floor(Math.random() * 4) + 1;
    return contributionLevels[level];
  };
  
  // Generate month labels positioned above their respective weeks
  const getMonthLabels = () => {
    const labels = [];
    const weeksPerMonth = totalWeeks / 12;
    
    for (let i = 0; i < 12; i++) {
      const position = Math.floor(i * weeksPerMonth);
      labels.push(
        <div 
          key={i} 
          className="text-xs text-gray-400 absolute top-0"
          style={{ left: `${(position / totalWeeks) * 100}%` }}
        >
          {months[i]}
        </div>
      );
    }
    return labels;
  };
  
  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-gray-400 text-sm font-mono">
        {filledCells.size} contributions in the last year
      </h2>
      
      <div className="relative">
        {/* Month labels */}
        <div className="relative h-4 mb-2 w-full">
          {getMonthLabels()}
        </div>
        
        {/* Contribution grid */}
        <div 
          className="grid gap-1 p-4 bg-gray-800/30 rounded-lg backdrop-blur-sm"
          style={{ 
            gridTemplateColumns: `repeat(${totalWeeks}, 1fr)`,
            gridTemplateRows: `repeat(${daysPerWeek}, 1fr)`
          }}
        >
          {Array.from({ length: totalCells }, (_, index) => {
            // Calculate week and day for proper positioning
            const week = Math.floor(index / daysPerWeek);
            const day = index % daysPerWeek;
            
            return (
              <div
                key={index}
                className={`w-2.5 h-2.5 rounded-sm transition-all duration-200 ${getCellStyle(index)}`}
                style={{
                  gridColumn: week + 1,
                  gridRow: day + 1,
                }}
              />
            );
          })}
        </div>
        
        {/* Day labels */}
        <div className="flex flex-col text-xs text-gray-500 absolute left-0 top-6 -ml-8">
          <div className="h-2.5 mb-1"></div>
          <div className="h-2.5 mb-1">Mon</div>
          <div className="h-2.5 mb-1"></div>
          <div className="h-2.5 mb-1">Wed</div>
          <div className="h-2.5 mb-1"></div>
          <div className="h-2.5 mb-1">Fri</div>
          <div className="h-2.5"></div>
        </div>
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
