/**
 * Badge Component
 * @description Status badges with color variants
 */

import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-gray-50 text-gray-700 border-gray-200',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge = ({
  variant = 'neutral',
  size = 'md',
  children,
  className,
}: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-lg border',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

