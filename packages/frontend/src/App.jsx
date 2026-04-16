import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginView } from './features/auth/authLoginView.jsx';
import { RegisterView } from './features/auth/authRegisterView.jsx';
import DashboardView from './features/dashboard/dashboardView.jsx';
import GameSetupView from './features/game/gameSetupView.jsx';
import GameView from './features/game/gameView.jsx';
import MatchHistoryView from './features/matchHistory/matchHistoryView.jsx';
import { RouteGuard } from './components/RouteGuard.jsx';

/**
 * App Module - Premium TicTacToang Router.
 * Implements Layer 5 Middleware (RouteGuard) for SRS A.2.c Compliance.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Landing & Entrance */}
        <Route path="/" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />

        {/* Protected Routes - Player & Admin Access (SRS A.2.c) */}
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
          path="/game/offline" 
          element={
            <RouteGuard allowedRoles={['PLAYER', 'ADMIN']}>
              <GameView />
            </RouteGuard>
          } 
        />
        
        <Route 
          path="/game/ai" 
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
              <div className="p-8 text-white font-orbitron">Admin Control Panel (Authorized Only)</div>
            </RouteGuard>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;

