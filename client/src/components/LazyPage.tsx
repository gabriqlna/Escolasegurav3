import React, { Suspense } from 'react';
import { LoadingSpinner, DashboardSkeleton } from './LoadingSpinner';

interface LazyPageProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function LazyPage({ children, fallback, className }: LazyPageProps) {
  const defaultFallback = (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" message="Carregando página..." />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <div className={className}>
        {children}
      </div>
    </Suspense>
  );
}

export function LazyDashboardPage({ children, fallback }: LazyPageProps) {
  return (
    <Suspense fallback={fallback || <DashboardSkeleton />}>
      <div className="animate-in fade-in-0 duration-300">
        {children}
      </div>
    </Suspense>
  );
}