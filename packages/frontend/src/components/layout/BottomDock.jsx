import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomDock = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-surface-bright/50 backdrop-blur-2xl rounded-2xl border border-outline-variant/20 shadow-2xl z-50">
      <Link to="/dashboard" className={`p-3 rounded-xl transition-all active:scale-90 ${isActive('/dashboard') ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface/70 hover:text-primary'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/dashboard') ? "'FILL' 1" : "''" }}>play_arrow</span>
      </Link>
      
      <div className="w-[1px] h-6 bg-outline-variant/30 mx-2"></div>
      
      <button className="p-3 text-on-surface/70 hover:text-primary transition-colors">
        <span className="material-symbols-outlined">leaderboard</span>
      </button>
      
      <button className="p-3 text-on-surface/70 hover:text-primary transition-colors">
        <span className="material-symbols-outlined">history</span>
      </button>
      
      <Link to="/profile" className={`p-3 rounded-xl transition-all active:scale-90 ${isActive('/profile') ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface/70 hover:text-primary'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/profile') ? "'FILL' 1" : "''" }}>person</span>
      </Link>

      <button className="p-3 text-on-surface/70 hover:text-primary transition-colors">
        <span className="material-symbols-outlined">notifications</span>
      </button>
    </nav>
  );
};

export default BottomDock;
