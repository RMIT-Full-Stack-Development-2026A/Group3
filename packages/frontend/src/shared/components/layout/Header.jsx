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
    <header className={`fixed top-0 w-full z-50 flex justify-between items-center px-8 py-4 backdrop-blur-xl transition-all duration-500 ${
      isVN 
        ? 'bg-slate-950/80 text-vn-tertiary border-b border-vn-tertiary/30 shadow-lg shadow-black/50' 
        : isSG
        ? 'bg-slate-950/80 border-b border-sg-cyan/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
        : 'bg-slate-950/40 shadow-[0_8px_32px_0_rgba(16,11,31,0.4)]'
    }`}>
      <div className="flex items-center gap-8">
        <Link to="/dashboard">
          <GradientText
            colors={
              isVN 
                ? ["#facc15", "#ea580c", "#facc15", "#ea580c", "#facc15"]
                : isSG 
                ? ["#22d3ee", "#c026d3", "#22d3ee", "#c026d3", "#22d3ee"]
                : ["#8b5cf6", "#d946ef", "#8b5cf6", "#d946ef", "#8b5cf6"]
            }
            animationSpeed={isVN || isSG ? 5 : 3}
            showBorder={false}
            className={`text-2xl font-bold font-headline tracking-tight hover:brightness-110 ${
              isVN ? 'uppercase tracking-widest' : isSG ? 'italic font-black' : ''
            }`}
          >
              TicTacToang
          </GradientText>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <Link to="/profile" className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-colors active:scale-95 block ${
          isVN ? 'border-vn-tertiary/50 hover:border-vn-tertiary' : isSG ? 'border-sg-magenta/50 hover:border-sg-magenta' : 'border-primary/30 hover:border-primary'
        }`}>
          <img 
            alt="User Avatar" 
            className="w-full h-full object-cover" 
            src={getAvatarUrl(user?.avatarUrl, 100)} 
          />
        </Link>
        
        <Link to="/profile" className={`px-5 py-2 font-bold rounded-lg transition-all active:scale-95 ${
          isVN 
            ? 'bg-vn-tertiary text-vn-on-tertiary shadow-lg shadow-vn-tertiary/20' 
            : isSG
            ? 'bg-sg-magenta text-white shadow-[0_0_20px_rgba(192,38,211,0.4)] hover:bg-sg-magenta/80 uppercase text-xs tracking-widest'
            : 'bg-gradient-to-br from-primary to-primary-container text-on-primary hover:shadow-[0_0_15px_rgba(179,161,255,0.3)]'
        }`}>
          Subscription
        </Link>
        
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
