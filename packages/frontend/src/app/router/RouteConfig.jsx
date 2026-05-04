import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Features
import LoginView from '../../features/auth/LoginView';
import RegisterView from '../../features/auth/RegisterView';
import DashboardView from '../../features/dashboard/DashboardView';
import GameBoardView from '../../features/game/GameBoardView';
import MatchHistoryView from '../../features/matchHistory/MatchHistoryView';
import ProfileView from '../../features/profile/ProfileView';
import AdminDashboardView from '../../features/admin/AdminDashboardView';
import AdminUserManagementView from '../../features/admin/AdminUserManagementView';

// Shared
import { RouteGuard } from '../../shared/components/RouteGuard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginView />,
  },
  {
    path: '/register',
    element: <RegisterView />,
  },
  {
    path: '/dashboard',
    element: (
      <RouteGuard allowedRoles={['PLAYER', 'ADMIN']}>
        <DashboardView />
      </RouteGuard>
    ),
  },
  {
    path: '/game/ai/:sessionId',
    element: (
      <RouteGuard allowedRoles={['PLAYER', 'ADMIN']}>
        <GameBoardView />
      </RouteGuard>
    ),
  },
  {
    path: '/game/local/:sessionId',
    element: (
      <RouteGuard allowedRoles={['PLAYER', 'ADMIN']}>
        <GameBoardView />
      </RouteGuard>
    ),
  },
  {
    path: '/match-history',
    element: (
      <RouteGuard allowedRoles={['PLAYER', 'ADMIN']}>
        <MatchHistoryView />
      </RouteGuard>
    ),
  },
  {
    path: '/profile',
    element: (
      <RouteGuard allowedRoles={['PLAYER', 'ADMIN']}>
        <ProfileView />
      </RouteGuard>
    ),
  },

  {
    path: '/admin',
    element: (
      <RouteGuard allowedRoles={['ADMIN']}>
        <AdminDashboardView />
      </RouteGuard>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <RouteGuard allowedRoles={['ADMIN']}>
        <AdminUserManagementView />
      </RouteGuard>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  }
]);
