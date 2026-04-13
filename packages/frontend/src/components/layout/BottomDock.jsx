import React from 'react';

const BottomDock = () => {
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-surface-bright/50 backdrop-blur-2xl rounded-2xl border border-outline-variant/20 shadow-2xl z-50">
      <button className="p-3 bg-primary text-on-primary rounded-xl shadow-lg active:scale-90 transition-transform">
        <span className="material-symbols-outlined" data-weight="fill">play_arrow</span>
      </button>
      
      <div className="w-[1px] h-6 bg-outline-variant/30 mx-2"></div>
      
      <button className="p-3 text-on-surface/70 hover:text-primary transition-colors">
        <span className="material-symbols-outlined">leaderboard</span>
      </button>
      
      <button className="p-3 text-on-surface/70 hover:text-primary transition-colors">
        <span className="material-symbols-outlined">history</span>
      </button>
      
      <button className="p-3 text-on-surface/70 hover:text-primary transition-colors">
        <span className="material-symbols-outlined">notifications</span>
      </button>
    </nav>
  );
};

export default BottomDock;
