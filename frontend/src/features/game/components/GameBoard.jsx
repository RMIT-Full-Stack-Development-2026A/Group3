import React from 'react';

const GameBoard = ({ board, winLine, onCellClick, currentMarker }) => {
  const size = board.length;
  
  // Marker to Icon mapping
  const markerIcons = {
    'CROSS': 'close',
    'CIRCLE': 'circle',
    'TRIANGLE': 'change_history',
    'SQUARE': 'square',
    'DIAMOND': 'diamond',
    'STAR': 'grade',
    'X': 'close',
    'O': 'circle'
  };

  const getIcon = (cell) => {
    if (!cell) return null;
    const normalized = cell.toString().toUpperCase();
    return markerIcons[normalized] || 'close';
  };

  return (
    <div className="glass-panel p-2 lg:p-4 rounded-2xl border border-outline-variant/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] w-full max-w-[700px] relative aspect-square transition-all duration-300">
      {/* Grid */}
      <div 
        className="grid gap-[1px] bg-white/20 p-[1px] rounded-lg w-full h-full shadow-[0_0_40px_rgba(0,0,0,0.6)]"
        style={{ 
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`
        }}
      >
        {board.map((row, rIdx) => 
          row.map((cell, cIdx) => {
            // Robust winCell check supporting both [r,c] and {row,col}/{r,c}
            const isWinCell = winLine?.some(item => {
              if (!item) return false;
              if (Array.isArray(item)) return item[0] === rIdx && item[1] === cIdx;
              const r = item.row ?? item.r;
              const c = item.col ?? item.c;
              return r === rIdx && c === cIdx;
            });
            
            return (
              <button
                key={`${rIdx}-${cIdx}`}
                onClick={() => onCellClick(cIdx, rIdx)}
                disabled={cell !== null}
                className={`aspect-square bg-[#0a0812] transition-all rounded-[1px] flex items-center justify-center text-[10px] md:text-sm lg:text-lg font-black relative overflow-hidden active:scale-95 group border border-white/5 shadow-inner ${
                  cell === null ? 'hover:bg-white/[0.04] cursor-pointer' : 'cursor-default'
                } ${isWinCell ? 'bg-primary/20' : ''}`}
              >
                {/* Subtle hover effect */}
                {cell === null && (
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors" />
                )}
                
                {cell && (
                  <span className={`
                    ${['CROSS', 'X'].includes(cell.toString().toUpperCase()) ? 'text-primary marker-glow-x' : 'text-secondary marker-glow-o'}
                    ${isWinCell ? 'marker-winner-glow z-10 scale-125' : ''}
                    transition-all duration-300
                    material-symbols-outlined
                  `}>
                    {getIcon(cell)}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GameBoard;
