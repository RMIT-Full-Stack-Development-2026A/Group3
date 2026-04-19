import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gameService from '../gameService';

const GameSetupModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const navigate = useNavigate();
  const [boardSize, setBoardSize] = useState(10);
  const [selectedMarker, setSelectedMarker] = useState('close');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [moveFirst, setMoveFirst] = useState(1);
  const [loading, setLoading] = useState(false);

  const markers = [
    { id: 'close', icon: 'close' },
    { id: 'circle', icon: 'circle' },
    { id: 'triangle', icon: 'change_history' },
    { id: 'square', icon: 'square' },
    { id: 'diamond', icon: 'diamond' },
    { id: 'star', icon: 'grade' },
  ];

  const handleStart = async () => {
    setLoading(true);
    try {
      const markerMap = {
        'close': 'CROSS',
        'circle': 'CIRCLE',
        'triangle': 'TRIANGLE',
        'square': 'SQUARE',
        'diamond': 'DIAMOND',
        'star': 'STAR'
      };

      const p1Marker = markerMap[selectedMarker] || 'CROSS';
      const p2Marker = p1Marker === 'CROSS' ? 'CIRCLE' : 'CROSS';

      const config = {
        gameType: 'SINGLE',
        boardSize: boardSize,
        player1Marker: p1Marker,
        player2Marker: p2Marker,
        moveFirst: moveFirst === 1 ? 'player' : 'bot',
        difficulty: difficulty
      };
      
      const res = await gameService.createSession(config);
      const sessionId = res.data.sessionId || res.data._id || res.data.id;
      navigate(`/game/ai/${sessionId}`);
      onClose();
    } catch (err) {
      console.error('Failed to start game:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative glass-panel w-full max-w-lg rounded-2xl border border-outline-variant/15 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">Game Setup</h2>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="mb-10">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4">Board Size</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setBoardSize(10)}
                className={`flex flex-col items-center justify-center py-6 px-4 rounded-xl border transition-all duration-300 ${boardSize === 10 ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'}`}
              >
                <span className={`text-2xl font-black font-headline mb-1 ${boardSize === 10 ? 'text-primary' : 'text-on-surface'}`}>10 x 10</span>
                <span className="text-[10px] font-medium opacity-60">CLASSIC ARENA</span>
              </button>
              <button 
                onClick={() => setBoardSize(15)}
                className={`flex flex-col items-center justify-center py-6 px-4 rounded-xl border transition-all duration-300 ${boardSize === 15 ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'}`}
              >
                <span className={`text-2xl font-black font-headline mb-1 ${boardSize === 15 ? 'text-primary' : 'text-on-surface'}`}>15 x 15</span>
                <span className="text-[10px] font-medium opacity-60">GRAND MASTER</span>
              </button>
            </div>
          </div>

          <div className="mb-10">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4">Select Marker</label>
            <div className="grid grid-cols-3 gap-4">
              {markers.map((marker) => (
                <button
                  key={marker.id}
                  onClick={() => setSelectedMarker(marker.id)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all active:scale-95 group relative ${selectedMarker === marker.id ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(179,161,255,0.4)]' : 'bg-surface-container-highest/50 border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'}`}
                >
                  <span className={`material-symbols-outlined text-4xl ${selectedMarker === marker.id ? 'font-bold' : 'opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all'}`}>
                    {marker.icon}
                  </span>
                  {selectedMarker === marker.id && (
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-primary/50 animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4">Select Difficulty</label>
            <div className="grid grid-cols-3 gap-3">
              {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                <button 
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex items-center justify-center py-4 px-4 rounded-xl border transition-all duration-300 ${difficulty === level ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'}`}
                >
                  <span className="text-lg font-bold font-headline capitalize">{level.toLowerCase()}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4">Move First</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setMoveFirst(1)}
                className={`flex flex-col items-center justify-center py-4 px-4 rounded-xl border transition-all duration-300 ${moveFirst === 1 ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'}`}
              >
                <span className="text-lg font-bold font-headline">You</span>
              </button>
              <button 
                onClick={() => setMoveFirst(2)}
                className={`flex flex-col items-center justify-center py-4 px-4 rounded-xl border transition-all duration-300 ${moveFirst === 2 ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'}`}
              >
                <span className="text-lg font-bold font-headline">AI</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-extrabold text-xl tracking-tight shadow-[0_8px_24px_rgba(179,161,255,0.3)] hover:shadow-[0_12px_32px_rgba(179,161,255,0.5)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Initializing...' : 'Start Game'}
          </button>
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
      </div>
    </div>
  );
};

export default GameSetupModal;
