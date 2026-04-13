import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * RouteGuard - The Gatekeeper of Frontend.
 * Redirects unauthenticated users to the login page.
 * Implements Role Authorization (SRS A.2.c Requirement).
 */
export const RouteGuard = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // 1. Basic Auth Check
  if (!isAuthenticated) {
    // Save the intended location for "Redirect back after login" UX
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Role Authorization 
  if (allowedRoles.length > 0 && user?.role) {
    const hasRequiredRole = allowedRoles.includes(user.role.toUpperCase());

    if (!hasRequiredRole) {
      console.warn(`Access Denied: User role ${user.role} is not in [${allowedRoles}]`);
      return <Navigate to="/dashboard" replace />; // Redirect back to player safety
    }
  }

  // Authorized - Render the requested View
  return children;
};

