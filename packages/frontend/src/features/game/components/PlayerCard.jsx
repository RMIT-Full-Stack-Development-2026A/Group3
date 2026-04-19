import React from 'react';

const PlayerCard = ({ player, isCurrent }) => {
  return (
    <div className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-4 w-48
      ${isCurrent ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(179,161,255,0.3)]' : 'bg-surface-container-low border-white/5'}
    `}>
      <div className={`w-20 h-20 rounded-2xl overflow-hidden border-2 ${isCurrent ? 'border-primary' : 'border-white/10'}`}>
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player?.username || 'default'}`} 
          alt="Avatar" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="text-center">
        <h3 className="font-bold text-lg truncate max-w-[140px]">{player?.username}</h3>
        <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold mt-1">
          {isCurrent ? 'Thinking...' : 'Waiting'}
        </p>
      </div>
    </div>
  );
};

export default PlayerCard;
