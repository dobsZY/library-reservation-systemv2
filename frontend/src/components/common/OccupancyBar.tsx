import React from 'react';
import { cn } from '../../utils/cn';

interface OccupancyBarProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const OccupancyBar: React.FC<OccupancyBarProps> = ({
  percentage,
  size = 'md',
  showLabel = true,
  className,
}) => {
  const getColor = (pct: number): string => {
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 70) return 'bg-orange-500';
    if (pct >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', getColor(percentage))}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-gray-500">Doluluk</span>
          <span className={cn(
            'text-sm font-semibold',
            percentage >= 90 ? 'text-red-600' : 
            percentage >= 70 ? 'text-orange-600' : 
            percentage >= 50 ? 'text-yellow-600' : 'text-green-600'
          )}>
            %{Math.round(percentage)}
          </span>
        </div>
      )}
    </div>
  );
};

