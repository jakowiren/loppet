import { useState, useEffect } from 'react';

const ContributionBoard = () => {
  const [filledCells, setFilledCells] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  
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
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (!isAnimating) return;
    
    const animateContributions = () => {
      const totalDuration = 15000; // 15 seconds for contributions animation
      const fillPercentage = 0.7; // Fill 70% of cells
      const cellsToFill = Math.floor(totalCells * fillPercentage);
      
      // Create array of cells to fill in order (left to right, column by column)
      const cellsToFillArray: number[] = [];
      let filledCount = 0;
      
      // Fill column by column (week by week)
      for (let week = 0; week < totalWeeks && filledCount < cellsToFill; week++) {
        for (let day = 0; day < daysPerWeek && filledCount < cellsToFill; day++) {
          // Random chance to fill this cell (to make it look organic)
          if (Math.random() > 0.3) {
            const cellIndex = week * daysPerWeek + day;
            cellsToFillArray.push(cellIndex);
            filledCount++;
          }
        }
      }
      
      // Animate cells filling in sequence over 15 seconds
      cellsToFillArray.forEach((cellIndex, index) => {
        const delay = (index / cellsToFillArray.length) * totalDuration;
        setTimeout(() => {
          setFilledCells(prev => new Set([...prev, cellIndex]));
        }, delay);
      });
    };
    
    // Start first animation
    animateContributions();
    
    // Set up loop to restart animation every 30 seconds (synchronized with text)
    const loopInterval = setInterval(() => {
      // Clear all cells first
      setFilledCells(new Set());
      // Start animation again after a brief delay
      setTimeout(() => {
        animateContributions();
      }, 100);
    }, 30000); // 30 second loop
    
    return () => clearInterval(loopInterval);
  }, [isAnimating, totalCells]);
  
  const getCellStyle = (index: number) => {
    if (!filledCells.has(index)) {
      return contributionLevels[0]; // Empty cell
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
