import { useMemo } from 'react';
import { User, UserRole, Permission, RolePermissions } from '@/types';

// Define permission mappings for each role
// Updated to allow all users to view most data in real-time
const rolePermissions: RolePermissions = {
  aluno: [
    'reports:create',
    'reports:view',
    'reports:view_all', // NEW: Can see all reports in real-time
    'campaigns:view',
    'campaigns:view_all', // NEW: Can see all campaigns
    'dashboard:view',
    'visitors:view', // NEW: Can see active visitors
    'notices:view',
    'notices:view_all', // NEW: Can see all notices
    'checklist:view',
    'drills:participate',
    'drills:view' // NEW: Can see drills info
  ],
  funcionario: [
    'reports:create',
    'reports:view',
    'reports:view_all', // Can see all reports in real-time
    'reports:manage',
    'users:view',
    'visitors:register',
    'visitors:manage',
    'visitors:view', // Can see active visitors
    'emergency:trigger',
    'campaigns:view',
    'campaigns:view_all', // Can see all campaigns
    'campaigns:manage',
    'checklist:view',
    'checklist:complete',
    'checklist:manage',
    'drills:participate',
    'drills:manage',
    'drills:view',
    'notices:view',
    'notices:view_all', // Can see all notices
    'notices:create',
    'dashboard:view'
  ],
  direcao: [
    'reports:create',
    'reports:view',
    'reports:view_all', // Can see all reports in real-time
    'reports:manage',
    'users:view',
    'users:view_all', // Can see all users
    'users:manage',
    'visitors:register',
    'visitors:manage',
    'visitors:view', // Can see active visitors
    'emergency:trigger',
    'emergency:manage',
    'campaigns:view',
    'campaigns:view_all', // Can see all campaigns
    'campaigns:manage',
    'checklist:view',
    'checklist:complete',
    'checklist:manage',
    'drills:participate',
    'drills:manage',
    'drills:view',
    'notices:view',
    'notices:view_all', // Can see all notices
    'notices:create',
    'notices:manage',
    'dashboard:view',
    'dashboard:admin'
  ]
};

export const usePermissions = (user: User | null) => {
  const userPermissions = useMemo(() => {
    if (!user || !user.isActive) {
      return [];
    }
    return rolePermissions[user.role] || [];
  }, [user]);

  const hasPermission = (permission: string | string[]): boolean => {
    if (!user || !user.isActive) {
      return false;
    }

    if (Array.isArray(permission)) {
      return permission.some(p => userPermissions.includes(p as Permission));
    }

    return userPermissions.includes(permission as Permission);
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) {
      return false;
    }

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  };

  const isStudent = user?.role === 'aluno';
  const isStaff = user?.role === 'funcionario';
  const isAdmin = user?.role === 'direcao';

  return {
    hasPermission,
    hasRole,
    isStudent,
    isStaff,
    isAdmin,
    permissions: userPermissions
  };
};