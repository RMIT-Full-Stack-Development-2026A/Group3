import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardView from './features/dashboard/dashboardView.jsx';
import GameSetupView from './features/game/gameSetupView.jsx';
import GameView from './features/game/gameView.jsx';
import ProfileView from './features/profile/profileView.jsx';
import { LoginView } from './features/auth/authLoginView.jsx';
import { RegisterView } from './features/auth/authRegisterView.jsx';
import DashboardView from './features/dashboard/dashboardView.jsx';
import GameSetupView from './features/game/gameSetupView.jsx';
import GameView from './features/game/gameView.jsx';
import MatchHistoryView from './features/matchHistory/matchHistoryView.jsx';
import { RouteGuard } from './components/RouteGuard.jsx';

/**
 * App Module - Premium TicTacToang Router.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuthLoginView />} />
        <Route path="/register" element={<AuthRegisterView />} />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <RouteGuard allowedRoles={['PLAYER', 'ADMIN']}>
              <DashboardView />
            </RouteGuard>
          } 
        />
        
        <Route 
          path="/game-setup" 
          element={
            <RouteGuard allowedRoles={['PLAYER', 'ADMIN']}>
              <GameSetupView />
            </RouteGuard>
          } 
        />
        
        <Route 
          path="/game/offline/:sessionId?" 
          element={
            <RouteGuard allowedRoles={['PLAYER', 'ADMIN']}>
              <GameView />
            </RouteGuard>
          } 
        />
        
        <Route 
          path="/game/ai/:sessionId?" 
          element={
            <RouteGuard allowedRoles={['PLAYER', 'ADMIN']}>
              <GameView />
            </RouteGuard>
          } 
        />

        <Route
          path="/match-history"
          element={
            <RouteGuard allowedRoles={['PLAYER', 'ADMIN']}>
              <MatchHistoryView />
            </RouteGuard>
          }
        />

        {/* Level HD: RoleGuard for Admin Specific Pages */}
        <Route 
          path="/admin/*" 
          element={
            <RouteGuard allowedRoles={['ADMIN']}>
              <div className="p-8 text-white font-headline">Admin Control Panel (Authorized Only)</div>
            </RouteGuard>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <RouteGuard allowedRoles={['PLAYER', 'ADMIN']}>
              <ProfileView />
            </RouteGuard>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;

