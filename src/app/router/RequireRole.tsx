import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '../../modules/auth/store/useAuthStore';

export interface RequireRoleProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ allowedRoles, children }) => {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/acceso-denegado" replace />;
  }

  return <>{children}</>;
};

