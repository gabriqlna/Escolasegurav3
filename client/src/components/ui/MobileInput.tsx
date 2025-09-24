import React, { useState } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface MobileInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  isPassword?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: string;
}

// Mobile-compatible input component that bridges React Native and web interfaces
export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  value,
  onChange,
  onInput,
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
    ? (showPassword ? <EyeOff size={20} /> : <Eye size={20} />)
    : rightIcon;

  const handleRightIconPress = isPassword 
    ? togglePasswordVisibility 
    : onRightIconPress;

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={cn('mb-4', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {leftIcon}
          </div>
        )}
        
        <Input
          type={inputType}
          value={value}
          onChange={onChange}
          onInput={onInput}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'min-h-[44px]', // Mobile-friendly touch target
            leftIcon && 'pl-10',
            (finalRightIcon || isPassword) && 'pr-10',
            error && error.trim() ? 'border-red-500 focus-visible:ring-red-500' : '',
            className
          )}
          {...props}
        />
        
        {finalRightIcon && (
          <button
            type="button"
            onClick={handleRightIconPress}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {finalRightIcon}
          </button>
        )}
      </div>
      
      {error && error.trim() && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};