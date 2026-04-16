import React from 'react';

/**
 * PlayerCard Component
 * Displays player info, marker, and active turn status.
 * Supports a simplified 'isBot' mode for AI opponents.
 */
const PlayerCard = ({ 
  name, 
  marker, 
  isActive, 
  isOpponent, 
  score = 0, 
  avatar = '', 
  isBot = false 
}) => {
  // Map marker IDs to Material Icons
  const getMarkerIcon = (m) => {
    const map = {
      'CROSS': 'close',
      'CIRCLE': 'circle',
      'TRIANGLE': 'change_history',
      'SQUARE': 'square_foot',
      'DIAMOND': 'diamond',
      'STAR': 'star'
    };
    return map[m] || 'close';
  };

  const markerIcon = getMarkerIcon(marker);

  // Simplified Bot UI
  if (isBot) {
    return (
      <div className={`relative px-6 py-4 rounded-2xl transition-all duration-500 overflow-hidden ${
        isActive 
          ? 'bg-primary/10 border-2 border-primary/50 shadow-[0_0_30px_rgba(179,161,255,0.2)]' 
          : 'bg-surface-container-lowest/40 border border-outline-variant/30 opacity-80'
      }`}>
        {/* Progress Glow for Active Turn */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-pulse" />
        )}

        <div className="relative flex flex-col items-center gap-3">
          {/* AI Label */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/50">
            <span className="material-symbols-outlined text-[14px] text-primary animate-pulse">memory</span>
            <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant">AI CORE</span>
          </div>

          {/* Large Neon Marker */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
            isActive 
              ? 'bg-primary text-on-primary shadow-[0_0_40px_rgba(179,161,255,0.6)] scale-110' 
              : 'bg-surface-container-high text-on-surface-variant/40'
          }`}>
            <span className="material-symbols-outlined text-4xl font-light">{markerIcon}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xl font-headline font-black text-on-surface tracking-tight">{score}</span>
            <span className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-tighter">Matches Won</span>
          </div>
        </div>
      </div>
    );
  }

  // Normal Player UI (Stitch Design)
  return (
    <div className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 ${
      isOpponent ? 'flex-row-reverse text-right' : 'text-left'
    } ${
      isActive 
        ? 'bg-primary/10 border-2 border-primary/50 shadow-[0_0_30px_rgba(179,161,255,0.2)] scale-[1.02]' 
        : 'bg-surface-container-lowest/40 border border-outline-variant/30 opacity-60'
    }`}>
      
      {/* Avatar with Status Ring */}
      <div className="relative shrink-0">
        <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${
          isActive ? 'border-primary shadow-[0_0_20px_rgba(179,161,255,0.4)]' : 'border-outline-variant/30'
        }`}>
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-3xl italic font-black">
                {name?.charAt(0) || 'P'}
              </span>
            </div>
          )}
        </div>
        
        {/* Active Turn Badge */}
        {isActive && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <span className="material-symbols-outlined text-[14px] text-on-primary font-bold">bolt</span>
          </div>
        )}
      </div>

      {/* Info Info */}
      <div className="grow min-w-0">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-0.5">
          {isOpponent ? 'Opponent' : 'You'}
        </h3>
        <h2 className="text-xl font-headline font-black text-on-surface truncate tracking-tight mb-1">
          {name}
        </h2>
        
        <div className={`flex items-center gap-3 ${isOpponent ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
            isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
          }`}>
            <span className="material-symbols-outlined text-[16px]">{markerIcon}</span>
            <span className="text-[11px] font-bold tracking-tight">{marker}</span>
          </div>
          <span className="text-lg font-headline font-black text-primary">{score}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
