import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Features
import LoginView from '../../features/Auth/LoginView';
import RegisterView from '../../features/Auth/RegisterView';
import DashboardView from '../../features/Dashboard/DashboardView';
import GameBoardView from '../../features/Game/GameBoardView';
import GameSetupView from '../../features/Game/GameSetupView';
import MatchHistoryView from '../../features/MatchHistory/MatchHistoryView';
import ProfileView from '../../features/Profile/ProfileView';

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
    path: '/game-setup',
    element: (
      <RouteGuard allowedRoles={['PLAYER', 'ADMIN']}>
        <GameSetupView />
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
    path: '/game/offline/:sessionId',
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
        <div className="p-8 text-white font-headline">Admin Control Panel (Authorized Only)</div>
      </RouteGuard>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  }
]);
