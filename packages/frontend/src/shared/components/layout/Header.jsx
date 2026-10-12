import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthActions } from '../../../app/store/authStore';
import { getAvatarUrl } from '../../../shared/utils/avatarUtil';

import GradientText from '../ui/gradient-text/GradientText';

const Header = ({ user, theme = 'DEFAULT' }) => {
  const isVN = theme === 'VIETNAM';
  const isSG = theme === 'SAIGON';
  const isTransparent = isVN || isSG;
  const navigate = useNavigate();
  const logout = useAuthActions().logout;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={`fixed top-0 w-full z-50 flex justify-between items-center gap-3 px-4 md:px-8 py-4 backdrop-blur-xl transition-all duration-500 ${
      isVN 
        ? 'bg-slate-950/80 text-vn-tertiary border-b border-vn-tertiary/30 shadow-lg shadow-black/50' 
        : isSG
        ? 'bg-slate-950/80 border-b border-sg-cyan/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
        : 'bg-slate-950/40 shadow-[0_8px_32px_0_rgba(16,11,31,0.4)]'
    }`}>
      <div className="flex items-center gap-8">
        <Link to="/dashboard">
          {isVN || isSG ? (
            <GradientText
              colors={
                isVN
                  ? ["#facc15", "#ea580c", "#facc15", "#ea580c", "#facc15"]
                  : ["#22d3ee", "#c026d3", "#22d3ee", "#c026d3", "#22d3ee"]
              }
              animationSpeed={5}
              showBorder={false}
              className={`text-lg md:text-2xl font-bold font-headline tracking-tight hover:brightness-110 shrink-0 ${
                isVN ? 'uppercase tracking-widest' : 'italic font-black'
              }`}
            >
                TicTacToang
            </GradientText>
          ) : (
            <span className="text-lg md:text-2xl font-bold font-headline tracking-tight text-volt hover:text-volt-dim transition-colors shrink-0">
              TicTacToang
            </span>
          )}
        </Link>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <Link to="/profile" className={`w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-full overflow-hidden border-2 transition-colors active:scale-95 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
          isVN ? 'border-vn-tertiary/50 hover:border-vn-tertiary' : isSG ? 'border-sg-magenta/50 hover:border-sg-magenta' : 'border-volt/30 hover:border-volt'
        }`}>
          <img
            alt="User Avatar"
            className="w-full h-full object-cover"
            width="40"
            height="40"
            src={getAvatarUrl(user?.avatarUrl, 100)}
          />
        </Link>

        <Link to="/profile" className={`px-3 py-1.5 text-sm md:px-5 md:py-2 md:text-base font-bold rounded-lg transition-all active:scale-95 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
          isVN
            ? 'bg-vn-tertiary text-vn-on-tertiary shadow-lg shadow-vn-tertiary/20'
            : isSG
            ? 'bg-sg-magenta text-white shadow-[0_0_20px_rgba(192,38,211,0.4)] hover:bg-sg-magenta/80 uppercase text-xs tracking-widest'
            : 'bg-volt text-volt-ink hover:shadow-[0_0_15px_rgba(195,255,74,0.4)]'
        }`}>
          Subscription
        </Link>

        <button
          onClick={handleLogout}
          aria-label="Log out"
          className="p-2 shrink-0 text-slate-400 hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60 rounded-lg"
        >
          <span className="material-symbols-outlined" aria-hidden="true">logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
