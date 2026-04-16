import React from 'react';

const StatsBoard = ({ stats }) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Current Rating Card */}
      <div className="relative overflow-hidden group p-8 rounded-2xl bg-surface-container-high/60 border border-white/5 flex flex-col justify-between min-h-[220px]">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="material-symbols-outlined text-8xl">trending_up</span>
        </div>
        <span className="text-on-surface-variant text-sm font-semibold uppercase tracking-widest">Current Rating</span>
        <div>
          <h2 className="text-6xl font-extrabold headline-font text-primary tracking-tighter">{stats?.eloRating || 1000}</h2>
          <p className="text-secondary text-sm mt-1 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_upward</span>
            Global Rank: #1,204
          </p>
        </div>
      </div>

      {/* Battle Analytics Card */}
      <div className="md:col-span-2 relative p-8 rounded-2xl bg-surface-container-high/60 border border-white/5 flex flex-col md:flex-row gap-8 items-center justify-around">
        <div className="flex flex-col items-center gap-2">
          {/* Circular Progress */}
          <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 96 96">
              <circle className="text-white/5" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
              <circle 
                className="text-primary" 
                cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * parseFloat(stats?.winRate || 0)) / 100}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              ></circle>
            </svg>
            <span className="text-2xl font-bold headline-font">{stats?.winRate || '0%'}</span>
          </div>
          <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Win Rate</span>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-6 flex-1 text-center md:text-left">
          <div className="space-y-1">
            <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Total Battles</span>
            <p className="text-2xl font-bold headline-font text-on-surface">{stats?.totalGames || 0}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Victories</span>
            <p className="text-2xl font-bold headline-font text-on-surface">{stats?.wins || 0}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Total Draws</span>
            <p className="text-2xl font-bold headline-font text-on-surface">{stats?.draws || 0}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Losses</span>
            <p className="text-2xl font-bold headline-font text-on-surface">{stats?.losses || 0}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsBoard;
