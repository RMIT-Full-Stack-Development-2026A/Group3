import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../app/store/authStore';

/**
 * RouteGuard - Protects routes based on authentication and roles.
 */
export const RouteGuard = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to dashboard if role is not allowed
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
