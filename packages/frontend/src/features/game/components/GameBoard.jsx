import React from 'react';

const GameBoard = ({ board, onMove, status, winner }) => {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-surface-container-high rounded-2xl border border-white/5 shadow-2xl relative">
      {board?.map((cell, index) => (
        <button
          key={index}
          onClick={() => onMove(index)}
          disabled={status !== 'IN_PROGRESS' || cell !== null}
          className={`w-20 h-20 md:w-28 md:h-28 rounded-xl flex items-center justify-center text-4xl font-bold transition-all
            ${!cell && status === 'IN_PROGRESS' ? 'bg-white/5 hover:bg-white/10 cursor-pointer' : 'bg-white/10 cursor-default'}
            ${cell === 'X' ? 'text-primary' : 'text-secondary'}
          `}
        >
          {cell}
        </button>
      ))}
    </div>
  );
};

export default GameBoard;
