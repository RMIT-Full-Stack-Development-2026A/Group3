import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gameService from '../gameService';

const GameSetupModal = ({ isOpen, mode = 'AI', onClose }) => {
  if (!isOpen) return null;
  const navigate = useNavigate();
  const [boardSize, setBoardSize] = useState(10);
  const [loading, setLoading] = useState(false);
  
  // AI specific / P1 state
  const [p1Marker, setP1Marker] = useState('close');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [moveFirst, setMoveFirst] = useState(1);
  
  // Local specific / P2 state
  const [p2Marker, setP2Marker] = useState('circle');
  const [activeSelector, setActiveSelector] = useState('P1');

  const markers = [
    { id: 'close', icon: 'close' },
    { id: 'circle', icon: 'circle' },
    { id: 'triangle', icon: 'change_history' },
    { id: 'square', icon: 'square' },
    { id: 'diamond', icon: 'diamond' },
    { id: 'star', icon: 'grade' },
  ];

  const markerMap = {
    'close': 'CROSS',
    'circle': 'CIRCLE',
    'triangle': 'TRIANGLE',
    'square': 'SQUARE',
    'diamond': 'DIAMOND',
    'star': 'STAR'
  };

  const handleMarkerSelect = (markerId) => {
    if (mode === 'AI') {
      setP1Marker(markerId);
    } else {
      if (activeSelector === 'P1') {
        if (markerId === p2Marker) return;
        setP1Marker(markerId);
      } else {
        if (markerId === p1Marker) return;
        setP2Marker(markerId);
      }
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const p1 = markerMap[p1Marker];
      const p2 = markerMap[p2Marker];

      const config = {
        gameType: mode === 'AI' ? 'SINGLE' : 'LOCAL',
        boardSize: boardSize,
        player1Marker: p1,
        player2Marker: p2,
        // AI specific
        ...(mode === 'AI' && {
          moveFirst: moveFirst === 1 ? 'player' : 'bot',
          difficulty: difficulty
        })
      };
      
      if (mode === 'LOCAL') {
        const localSession = {
          gameType: 'LOCAL',
          boardSize: config.boardSize,
          players: {
            p1: { name: 'Player 1', marker: config.player1Marker },
            p2: { name: 'Player 2', marker: config.player2Marker }
          },
          status: 'ACTIVE',
          currentTurn: moveFirst === 1 ? 'PLAYER1' : 'PLAYER2'
        };
        navigate('/game/local/new', { state: { config: localSession } });
        onClose();
        return;
      }

      const res = await gameService.createSession(config);
      const sessionId = res.data.sessionId || res.data._id || res.data.id;
      
      const path = mode === 'AI' ? `/game/ai/${sessionId}` : `/game/local/${sessionId}`;
      navigate(path);
      onClose();
    } catch (err) {
      console.error('Failed to start game:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop Dimmer */}
      <div className="absolute inset-0 bg-[#000000]/70 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Game Setup Modal */}
      <div className="relative glass-panel w-full max-w-lg rounded-2xl border border-outline-variant/15 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="p-8">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-7">
            <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">Game Setup</h2>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-2 hover:bg-white/5 rounded-full">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Section 1: Board Size */}
          <div className="mb-7">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4">Board Size</label>
            <div className="grid grid-cols-2 gap-4">
              {[10, 15].map(size => (
                <button 
                  key={size}
                  onClick={() => setBoardSize(size)}
                  className={`flex flex-col items-center justify-center py-6 px-4 rounded-xl border transition-all duration-300 ${
                    boardSize === size 
                    ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' 
                    : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'
                  }`}
                >
                  <span className={`text-2xl font-black font-headline mb-1 ${boardSize === size ? 'text-primary' : 'text-on-surface'}`}>
                    {size} x {size}
                  </span>
                  <span className={`text-[10px] font-medium ${boardSize === size ? 'opacity-60' : 'opacity-40'}`}>
                    {size === 10 ? 'CLASSIC ARENA' : 'GRAND MASTER'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Select Marker */}
          <div className="mb-7">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-primary">Select Marker</label>
              
              {/* Local Mode: Player Selector Tabs */}
              {mode === 'LOCAL' && (
                <div className="flex p-1 bg-surface-container-highest/50 rounded-lg border border-white/5">
                  <button 
                    onClick={() => setActiveSelector('P1')}
                    className={`px-3 py-1 rounded-md text-[10px] font-black tracking-widest transition-all duration-300 flex items-center gap-1.5 ${
                      activeSelector === 'P1' 
                      ? 'bg-primary text-on-primary shadow-lg scale-105' 
                      : 'text-on-surface/40 hover:text-on-surface/70'
                    }`}
                  >
                    PLAYER 1
                  </button>
                  <button 
                    onClick={() => setActiveSelector('P2')}
                    className={`px-3 py-1 rounded-md text-[10px] font-black tracking-widest transition-all duration-300 flex items-center gap-1.5 ${
                      activeSelector === 'P2' 
                      ? 'bg-cyan-500 text-white shadow-lg scale-105' 
                      : 'text-on-surface/40 hover:text-on-surface/70'
                    }`}
                  >
                    PLAYER 2
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {markers.map((marker) => {
                const isP1 = p1Marker === marker.id;
                const isP2 = p2Marker === marker.id && mode === 'LOCAL';
                const isActive = (mode === 'AI' && isP1) || 
                                 (mode === 'LOCAL' && ((activeSelector === 'P1' && isP1) || (activeSelector === 'P2' && isP2)));
                const isDisabled = mode === 'LOCAL' && ((activeSelector === 'P1' && isP2) || (activeSelector === 'P2' && isP1));
                
                return (
                  <button
                    key={marker.id}
                    disabled={isDisabled}
                    onClick={() => handleMarkerSelect(marker.id)}
                    className={`aspect-square flex items-center justify-center rounded-xl transition-all active:scale-95 group relative border ${
                      isActive 
                      ? 'bg-gradient-to-br from-primary to-primary-container border-transparent text-on-primary marker-glow' 
                      : 'bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant hover:text-primary'
                    } ${isDisabled ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
                  >
                    <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">
                      {marker.icon}
                    </span>
                    {mode === 'LOCAL' && (
                      <>
                        {isP1 && <div className="absolute top-2 left-2 bg-primary text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm text-on-primary">P1</div>}
                        {isP2 && <div className="absolute top-2 right-2 bg-cyan-500 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm text-white">P2</div>}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Select Difficulty (AI Only) */}
          {mode === 'AI' && (
            <div className="mb-7">
              <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4">Select Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                  <button 
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`flex items-center justify-center py-4 px-4 rounded-xl border transition-all duration-300 ${
                      difficulty === level 
                      ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' 
                      : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'
                    }`}
                  >
                    <span className="text-lg font-bold font-headline capitalize">{level.toLowerCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Move First */}
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-4">Move First</label>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map(p => {
                const isActive = moveFirst === p;
                let label = '';
                if (mode === 'AI') {
                  label = p === 1 ? 'You' : 'Bot';
                } else {
                  label = p === 1 ? 'Player 1' : 'Player 2';
                }
                
                return (
                  <button 
                    key={p}
                    onClick={() => setMoveFirst(p)}
                    className={`flex flex-col items-center justify-center py-4 px-4 rounded-xl border transition-all duration-300 active:scale-95 ${
                      isActive 
                      ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' 
                      : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'
                    }`}
                  >
                    <span className={`text-lg font-bold font-headline ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Action */}
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-extrabold text-xl tracking-tight shadow-[0_8px_24px_rgba(179,161,255,0.3)] hover:shadow-[0_12px_32px_rgba(179,161,255,0.5)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Initializing...' : 'Start Game'}
          </button>
        </div>

        {/* Bottom decorative glass accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
      </div>
    </div>
  );


};

export default GameSetupModal;
