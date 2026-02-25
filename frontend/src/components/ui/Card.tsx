/**
 * Card Component
 * @description Reusable card container with variants
 */

import { type ReactNode, type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

const variantClasses = {
  default: 'bg-white shadow-sm border border-gray-100',
  elevated: 'bg-white shadow-md',
  outlined: 'bg-white border border-gray-200',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl',
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = ({
  title,
  subtitle,
  action,
  className,
  ...props
}: CardHeaderProps) => {
  return (
    <div
      className={cn('flex items-center justify-between mb-4', className)}
      {...props}
    >
      <div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';

