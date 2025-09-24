import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface MobileButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

// Mobile-compatible button component that bridges React Native and web interfaces
export const MobileButton: React.FC<MobileButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  onClick,
  className,
  type = 'button',
  ...props
}) => {
  const getWebVariant = () => {
    switch (variant) {
      case 'primary':
        return 'default';
      case 'secondary':
        return 'secondary';
      case 'outline':
        return 'outline';
      case 'destructive':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getWebSize = () => {
    switch (size) {
      case 'small':
        return 'sm';
      case 'large':
        return 'lg';
      case 'medium':
      default:
        return 'default';
    }
  };

  return (
    <Button
      variant={getWebVariant()}
      size={getWebSize()}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      className={cn(
        'min-h-[44px]', // Mobile-friendly touch target
        loading && 'cursor-wait',
        className
      )}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {title}
    </Button>
  );
};