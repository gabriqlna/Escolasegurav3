import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  onAuthStateChange, 
  getUserDocument, 
  createUserDocument,
  requestNotificationPermission 
} from '@/lib/firebase';
import { USER_ROLES, type UserRole } from '@shared/schema';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  firebaseUser: FirebaseUser;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  initializeUser: (firebaseUser: FirebaseUser, userData: {
    name: string;
    role: UserRole;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const ROLE_HIERARCHY: Record<UserRole, number> = {
  [USER_ROLES.ALUNO]: 1,
  [USER_ROLES.FUNCIONARIO]: 2,
  [USER_ROLES.DIRECAO]: 3,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        try {
          const userDoc = await getUserDocument(firebaseUser.uid);
          
          if (userDoc && (userDoc as any).isActive) {
            setUser({
              id: firebaseUser.uid,
              name: (userDoc as any).name,
              email: (userDoc as any).email,
              role: (userDoc as any).role,
              isActive: (userDoc as any).isActive,
              firebaseUser,
            });
            
            // Request notification permission for authenticated users
            await requestNotificationPermission();
          } else if (userDoc && !(userDoc as any).isActive) {
            // User is banned
            console.warn('User account is deactivated');
            setUser(null);
          } else {
            // User document doesn't exist - create temporary user for demo
            console.log('Creating temporary user for demo mode');
            const role = firebaseUser.email?.includes('admin') || firebaseUser.email?.includes('direcao') ? 'direcao' : 
                        firebaseUser.email?.includes('funcionario') ? 'funcionario' : 'aluno';
            
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
              email: firebaseUser.email || '',
              role: role as any,
              isActive: true,
              firebaseUser,
            });
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
          // Fallback to basic user creation for demo
          const role = firebaseUser.email?.includes('admin') || firebaseUser.email?.includes('direcao') ? 'direcao' : 
                      firebaseUser.email?.includes('funcionario') ? 'funcionario' : 'aluno';
          
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
            email: firebaseUser.email || '',
            role: role as any,
            isActive: true,
            firebaseUser,
          });
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const initializeUser = async (
    firebaseUser: FirebaseUser, 
    userData: { name: string; role: UserRole }
  ) => {
    try {
      // Security: Force all new users to be aluno (student)
      // Administrators can promote users later through admin panel
      await createUserDocument(firebaseUser.uid, {
        name: userData.name,
        email: firebaseUser.email!,
        role: 'aluno' as UserRole, // Always create as aluno
        isActive: true,
      });
      
      const userDoc = await getUserDocument(firebaseUser.uid);
      if (userDoc) {
        setUser({
          id: firebaseUser.uid,
          name: (userDoc as any).name,
          email: (userDoc as any).email,
          role: (userDoc as any).role,
          isActive: (userDoc as any).isActive,
          firebaseUser,
        });
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      throw error;
    }
  };

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user || !user.isActive) return false;
    
    const userRoleLevel = ROLE_HIERARCHY[user.role];
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(role => userRoleLevel >= ROLE_HIERARCHY[role]);
    }
    
    return userRoleLevel >= ROLE_HIERARCHY[requiredRole];
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && user.isActive,
    hasPermission,
    initializeUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};