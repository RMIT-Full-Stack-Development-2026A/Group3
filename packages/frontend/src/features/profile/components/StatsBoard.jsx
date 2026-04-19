import React from 'react';

const StatsBoard = ({ stats }) => {
  const statItems = [
    { label: 'Total Battles', value: stats?.totalGames, icon: 'swords' },
    { label: 'Victories', value: stats?.wins, icon: 'emoji_events', color: 'text-emerald-400' },
    { label: 'Losses', value: stats?.losses, icon: 'cancel', color: 'text-rose-400' },
    { label: 'Draws', value: stats?.draws, icon: 'balance', color: 'text-on-surface-variant' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {statItems.map((item, idx) => (
        <div key={idx} className="bg-surface-container-high/60 p-6 rounded-3xl border border-white/5 space-y-4">
          <span className={`material-symbols-outlined ${item.color || 'text-primary'}`}>{item.icon}</span>
          <div>
            <p className="text-3xl font-bold font-headline">{item.value || 0}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">{item.label}</p>
          </div>
        </div>
      ))}
      <div className="col-span-2 md:col-span-4 bg-primary/10 p-8 rounded-3xl border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center text-2xl font-bold font-headline">
            {stats?.winRate}
          </div>
          <div>
            <h3 className="text-2xl font-bold font-headline">Battle Mastery</h3>
            <p className="text-on-surface-variant">Your current win rate across all dimensions.</p>
          </div>
        </div>
        <div className="text-center md:text-right">
          <p className="text-4xl font-black font-headline text-primary">{stats?.eloRating}</p>
          <p className="text-xs uppercase font-bold tracking-widest text-on-surface-variant">ELO Rating</p>
        </div>
      </div>
    </div>
  );
};

export default StatsBoard;
