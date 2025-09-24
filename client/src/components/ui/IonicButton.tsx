import React from 'react';
import { IonButton, IonSpinner } from '@ionic/react';
import { cn } from '@/lib/utils';

interface IonicButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const IonicButton: React.FC<IonicButtonProps> = ({
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
  const getIonicFill = () => {
    switch (variant) {
      case 'primary':
        return 'solid';
      case 'secondary':
        return 'clear';
      case 'outline':
        return 'outline';
      case 'destructive':
        return 'solid';
      default:
        return 'solid';
    }
  };

  const getIonicColor = () => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'medium';
      case 'outline':
        return 'primary';
      case 'destructive':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const getIonicSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      case 'medium':
      default:
        return 'default';
    }
  };

  return (
    <IonButton
      fill={getIonicFill()}
      color={getIonicColor()}
      size={getIonicSize()}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      className={cn(className)}
      {...props}
    >
      {loading ? (
        <>
          <IonSpinner name="crescent" style={{ width: '20px', height: '20px', marginRight: '8px' }} />
          {title}
        </>
      ) : (
        title
      )}
    </IonButton>
  );
};