/**
 * ProgressBar Component
 * @description Animated progress bar with color variants
 */

import { cn } from '../../utils/cn';
import { getOccupancyLevel, type OccupancyLevel } from '../../utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

const colorClasses: Record<OccupancyLevel, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-rose-500',
};

export const ProgressBar = ({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const level = getOccupancyLevel(percentage);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Doluluk</span>
          <span className="font-semibold text-gray-800">%{Math.round(percentage)}</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorClasses[level]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';

