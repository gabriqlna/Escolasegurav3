import { useMemo } from 'react';
import { PERMISSIONS } from '@/constants/permissions';
import { User, UserRole } from '@/types';

export const usePermissions = (user: User | null) => {
  const hasPermission = useMemo(() => {
    return (permission: string | string[]): boolean => {
      if (!user) return false;
      
      const permissions = Array.isArray(permission) ? permission : [permission];
      
      return permissions.some(perm => {
        const allowedRoles = PERMISSIONS[perm];
        return allowedRoles && allowedRoles.includes(user.role);
      });
    };
  }, [user]);

  const hasRole = useMemo(() => {
    return (role: UserRole | UserRole[]): boolean => {
      if (!user) return false;
      
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(user.role);
    };
  }, [user]);

  const isStudent = useMemo(() => user?.role === 'aluno', [user]);
  const isStaff = useMemo(() => user?.role === 'funcionario', [user]);
  const isAdmin = useMemo(() => user?.role === 'direcao', [user]);

  return {
    hasPermission,
    hasRole,
    isStudent,
    isStaff,
    isAdmin,
    userRole: user?.role
  };
};