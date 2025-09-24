import React, { useState } from 'react';
import { IonItem, IonInput, IonIcon, IonButton, IonText } from '@ionic/react';
import { eye, eyeOff } from 'ionicons/icons';
import { cn } from '@/lib/utils';

interface IonicInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  isPassword?: boolean;
  value?: string;
  onInput?: (e: any) => void;
  onChange?: (e: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: string;
}

export const IonicInput: React.FC<IonicInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  value,
  onInput,
  onChange,
  placeholder,
  disabled,
  className,
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(!isPassword);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const finalRightIcon = isPassword 
    ? (showPassword ? eyeOff : eye)
    : rightIcon;

  const handleRightIconPress = isPassword 
    ? togglePasswordVisibility 
    : onRightIconPress;

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={cn('mb-4', className)}>
      {label && (
        <IonText color="dark">
          <p className="text-sm font-medium mb-2">{label}</p>
        </IonText>
      )}
      
      <IonItem 
        className={cn(
          'border rounded-md',
          error && error.trim() ? 'border-red-500' : 'border-gray-300'
        )}
        lines="none"
      >
        {leftIcon && (
          <IonIcon 
            icon={leftIcon} 
            slot="start" 
            className="text-gray-500"
          />
        )}
        
        <IonInput
          type={inputType}
          value={value}
          onIonInput={onInput || onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="text-base"
          {...props}
        />
        
        {finalRightIcon && (
          <IonButton 
            fill="clear" 
            slot="end" 
            onClick={handleRightIconPress}
            className="m-0 p-2"
          >
            <IonIcon 
              icon={finalRightIcon} 
              className="text-gray-500"
            />
          </IonButton>
        )}
      </IonItem>
      
      {error && (
        <IonText color="danger">
          <p className="text-xs mt-1">{error}</p>
        </IonText>
      )}
    </div>
  );
};