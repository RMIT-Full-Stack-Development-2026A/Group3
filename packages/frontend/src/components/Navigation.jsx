import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, LogOut } from 'lucide-react';
import { Avatar } from './Avatar.jsx';
import { useState } from 'react';
import { useAuthStore } from '../store/auth.store.js';
import AuthService from '../features/auth/auth.service.js';

/**
 * Navigation Component - Premium Navbar for TicTacToang.
 * Consumes Real Global State from AuthStore (Layer 5).
 */
export function Navigation() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Consumer of Global State
  const { user, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  return (
    <nav className="bg-page border-b border-border h-16 relative z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gold text-gold-glow font-orbitron">
            TicTacToang
          </h1>
        </Link>

        {isAuthenticated && user ? (
          <>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/arena" className="text-text-primary hover:text-gold transition-colors font-medium">
                Arena
              </Link>
              <Link to="/profile" className="text-text-primary hover:text-gold transition-colors font-medium">
                Profile
              </Link>
              <Link to="/subscription" className="text-text-primary hover:text-gold transition-colors font-medium">
                Premium
              </Link>
              <button className="relative p-2 text-text-primary hover:text-gold transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-coral rounded-full" />
              </button>

              <div className="flex items-center gap-4 pl-4 border-l border-border/50">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Avatar src={user.avatar} alt={user.username} premium={user.premium} size="sm" />
                  <span className="text-text-primary font-semibold">{user.username}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-surface border-b border-border md:hidden z-50 shadow-2xl">
                <div className="flex flex-col p-4 gap-4 bg-surface">
                  <div className="flex items-center gap-3 p-2 mb-2 border-b border-border/50">
                    <Avatar src={user.avatar} alt={user.username} premium={user.premium} size="sm" />
                    <span className="text-text-primary font-bold">{user.username}</span>
                  </div>
                  <Link to="/dashboard" className="text-text-primary hover:text-gold transition-colors py-2 font-medium">
                    Dashboard
                  </Link>
                  <Link to="/arena" className="text-text-primary hover:text-gold transition-colors py-2 font-medium">
                    Arena
                  </Link>
                  <Link to="/profile" className="text-text-primary hover:text-gold transition-colors py-2 font-medium">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-danger hover:bg-danger/10 py-2 font-bold"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex gap-4">
            <Link to="/" className="text-gold hover:text-gold-light transition-colors font-semibold">Login</Link>
            <Link to="/register" className="text-text-primary hover:text-gold transition-colors font-semibold">Join Team</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
