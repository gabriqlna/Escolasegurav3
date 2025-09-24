import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({ 
  className, 
  size = 'md', 
  message,
  ...props 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)} {...props}>
      <div 
        className={cn(
          "animate-spin rounded-full border-2 border-muted-foreground border-t-primary",
          sizeClasses[size]
        )}
        role="status"
        aria-label="Carregando"
      />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      {/* Welcome Section Skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded-md w-64" />
        <div className="h-4 bg-muted rounded-md w-48" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-muted rounded w-20" />
              <div className="h-4 w-4 bg-muted rounded" />
            </div>
            <div className="h-8 bg-muted rounded w-16" />
            <div className="h-3 bg-muted rounded w-24" />
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <div className="h-4 w-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-3 bg-muted rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-300">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-10 bg-muted rounded w-32" />
      </div>

      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-6 bg-muted rounded w-20" />
            </div>
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}