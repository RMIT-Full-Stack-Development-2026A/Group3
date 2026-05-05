import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../../shared/components/layout/MainLayout';
import AdminLayout from '../../shared/components/layout/AdminLayout';

// Features
import LoginView from '../../features/auth/LoginView';
import RegisterView from '../../features/auth/RegisterView';
import DashboardView from '../../features/dashboard/DashboardView';
import GameBoardView from '../../features/game/GameBoardView';
import MatchHistoryView from '../../features/matchHistory/MatchHistoryView';
import ProfileView from '../../features/profile/ProfileView';
import ReplayView from '../../features/replay/ReplayView';
import AdminDashboardView from '../../features/admin/AdminDashboardView';
import AdminUserManagementView from '../../features/admin/AdminUserManagementView';

// Shared
import { RouteGuard } from '../../shared/components/RouteGuard';

export const router = createBrowserRouter([
  { 
    path: '/login', 
    element: <LoginView /> 
  },
  { 
    path: '/register', 
    element: <RegisterView /> 
  },
  {
    path: '/',
    element: (
      <RouteGuard allowedRoles={['PLAYER', 'ADMIN']}>
        <MainLayout /> 
      </RouteGuard>
    ),
    children: [
      { 
        path: 'dashboard', 
        element: <DashboardView /> 
      },
      { 
        path: 'match-history',
        element: <MatchHistoryView /> 
      },
      { 
        path: 'profile', 
        element: <ProfileView /> 
      },
      {
        path: 'replay/:sessionId',
        element: <ReplayView />
      },
      { 
        path: 'game',
        children: [
          { 
            path: 'ai/:sessionId', 
            element: <GameBoardView /> 
          },
          { 
            path: 'local/:sessionId', 
            element: <GameBoardView /> 
          }
        ]
      },
      { 
        index: true, 
        element: <Navigate to="/dashboard" replace /> 
      }
    ]
  },

  // ADMIN ROUTES
  {
    path: '/admin',
    element: (
      <RouteGuard allowedRoles={['ADMIN']}>
        <AdminLayout />
      </RouteGuard>
    ),
    children: [
      { 
        index: true, 
        element: <AdminDashboardView /> 
      },
      { 
        path: 'users', 
        element: <AdminUserManagementView /> 
      },
    ]
  },
  { 
    path: '*', 
    element: <Navigate to="/dashboard" replace /> 
  }
]);
