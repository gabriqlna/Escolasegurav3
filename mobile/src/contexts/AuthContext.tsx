import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { authService } from '@/services/auth';
import { User, LoginForm, RegisterForm, ApiResponse } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (data: LoginForm) => Promise<ApiResponse<User>>;
  signUp: (data: RegisterForm) => Promise<ApiResponse<User>>;
  signOut: () => Promise<ApiResponse<void>>;
  hasPermission: (permission: string | string[]) => boolean;
  hasRole: (role: string | string[]) => boolean;
  isStudent: boolean;
  isStaff: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const permissions = usePermissions(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Error getting user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (data: LoginForm): Promise<ApiResponse<User>> => {
    setLoading(true);
    try {
      const result = await authService.signIn(data);
      if (result.success && result.data) {
        setUser(result.data);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: RegisterForm): Promise<ApiResponse<User>> => {
    setLoading(true);
    try {
      const result = await authService.signUp(data);
      if (result.success && result.data) {
        setUser(result.data);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<ApiResponse<void>> => {
    setLoading(true);
    try {
      const result = await authService.signOut();
      if (result.success) {
        setUser(null);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    hasPermission: permissions.hasPermission,
    hasRole: permissions.hasRole,
    isStudent: permissions.isStudent,
    isStaff: permissions.isStaff,
    isAdmin: permissions.isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};