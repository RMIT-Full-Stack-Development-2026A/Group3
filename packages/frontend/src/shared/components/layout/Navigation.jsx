import { LayoutDashboard, History, Settings, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
// Update import path: from ../store/authStore.js to ../../../store/authStore.js
import { useAuthStore } from '../../../app/store/authStore.js';
// Update import path: from ../lib/utils.js to ../../../lib/utils.js
import { cn } from '../../lib/utils.js';

const links = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/match-history', label: 'History', icon: History },
  { path: '/game-setup', label: 'Setup', icon: Settings }
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-page/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="font-orbitron text-lg font-bold tracking-wide text-gold"
          >
            TicTacToang
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-gold/15 text-gold'
                      : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                  )}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-text-secondary md:inline">{user?.username || 'Player'}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-4 left-1/2 z-40 flex w-[94%] max-w-md -translate-x-1/2 items-center justify-around rounded-xl border border-border bg-surface/95 p-2 backdrop-blur md:hidden">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path);

          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={cn(
                'flex min-w-20 flex-col items-center rounded-lg px-3 py-2 text-xs',
                isActive
                  ? 'bg-gold/15 text-gold'
                  : 'text-text-secondary'
              )}
            >
              <Icon size={18} />
              <span className="mt-1">{link.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
