import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameService from '../../features/game/gameService';
import { useAuthStore } from '../../store/authStore';

const GameSetupModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [setup, setSetup] = useState({
    boardSize: '10',
    marker: 'CROSS',
    difficulty: 'Medium',
    moveFirst: 'You'
  });

  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const gameConfig = {
        boardSize: setup.boardSize,
        player1Marker: setup.marker,
        player2Marker: setup.marker === 'CROSS' ? 'CIRCLE' : 'CROSS',
        difficulty: setup.difficulty,
        moveFirst: setup.moveFirst.toLowerCase(),
        gameType: 'SINGLE'
      };

      const response = await GameService.startGame(gameConfig, user?._id);
      
      if (response.success) {
        // Navigate to the session-based game URL
        navigate(`/game/ai/${response.data.id}`);
        onClose();
      }
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to connect to battle server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const boardSizes = [
    { label: '10 x 10', subtitle: 'CLASSIC ARENA', value: '10' },
    { label: '15 x 15', subtitle: 'GRAND MASTER', value: '15' }
  ];

  const markers = [
    { icon: 'close', id: 'CROSS' },
    { icon: 'circle', id: 'CIRCLE' },
    { icon: 'change_history', id: 'TRIANGLE' },
    { icon: 'square', id: 'SQUARE' },
    { icon: 'diamond', id: 'DIAMOND' },
    { icon: 'grade', id: 'STAR' }
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const players = ['You', 'Bot'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#000000]/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-surface-container-highest/60 backdrop-blur-3xl w-full max-w-lg rounded-2xl border border-outline-variant/15 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">Game Setup</h2>
            <button 
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-white/5"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Section 1: Board Size */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4">Board Size</label>
            <div className="grid grid-cols-2 gap-4">
              {boardSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setSetup({ ...setup, boardSize: size.value })}
                  className={`flex flex-col items-center justify-center py-6 px-4 rounded-xl border transition-all duration-300 ${
                    setup.boardSize === size.value 
                      ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' 
                      : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'
                  }`}
                >
                  <span className={`text-2xl font-black font-headline mb-1 ${setup.boardSize === size.value ? 'text-primary' : 'text-on-surface'}`}>
                    {size.label}
                  </span>
                  <span className={`text-[10px] font-medium ${setup.boardSize === size.value ? 'opacity-100' : 'opacity-40'}`}>
                    {size.subtitle}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Select Marker */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4">Select Marker</label>
            <div className="grid grid-cols-3 gap-4">
              {markers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSetup({ ...setup, marker: m.id })}
                  className={`aspect-square flex items-center justify-center rounded-xl transition-all active:scale-95 group ${
                    setup.marker === m.id 
                      ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-[0_0_20px_rgba(179,161,255,0.3)]' 
                      : 'bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span className={`material-symbols-outlined text-4xl group-hover:scale-110 transition-transform ${setup.marker === m.id ? 'font-bold' : ''}`}>
                    {m.icon}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Difficulty */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4">Select Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSetup({ ...setup, difficulty: diff })}
                  className={`flex items-center justify-center py-4 px-4 rounded-xl border transition-all duration-300 ${
                    setup.difficulty === diff 
                      ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]'
                      : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'
                  }`}
                >
                  <span className="text-lg font-bold font-headline">{diff}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Move First */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4">Move First</label>
            <div className="grid grid-cols-2 gap-4">
              {players.map((p) => (
                <button
                  key={p}
                  onClick={() => setSetup({ ...setup, moveFirst: p })}
                  className={`flex flex-col items-center justify-center py-4 px-4 rounded-xl border transition-all duration-300 ${
                    setup.moveFirst === p
                      ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]'
                      : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'
                  }`}
                >
                  <span className="text-lg font-bold font-headline">{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Action */}
          <button 
            onClick={handleStart}
            disabled={isLoading}
            className={`w-full py-5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-extrabold text-xl tracking-tight shadow-[0_8px_24px_rgba(179,161,255,0.3)] hover:shadow-[0_12px_32px_rgba(179,161,255,0.5)] active:scale-[0.98] transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin">refresh</span>
                Initializing...
              </div>
            ) : 'Start Game'}
          </button>
        </div>
        
        {/* Bottom decorative glass accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
      </div>
    </div>
  );
};

export default GameSetupModal;
