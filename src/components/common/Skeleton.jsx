/**
 * Skeleton Loading Component
 * Provides skeleton screens for loading states
 */

import { cn } from '@/lib/utils';

/**
 * Skeleton Component
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Variant: 'text' | 'circular' | 'rectangular'
 */
export function Skeleton({ className, variant = 'rectangular', ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted rounded',
        variant === 'text' && 'h-4 w-full',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'h-4 w-full',
        className
      )}
      {...props}
    />
  );
}

/**
 * SkeletonCard Component
 * Skeleton for card components
 */
export function SkeletonCard() {
  return (
    <div className="border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

/**
 * SkeletonList Component
 * Skeleton for list items
 */
export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
          <Skeleton variant="circular" className="w-10 h-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonText Component
 * Skeleton for text content
 */
export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={i === lines - 1 ? 'w-5/6' : 'w-full'}
        />
      ))}
    </div>
  );
}

