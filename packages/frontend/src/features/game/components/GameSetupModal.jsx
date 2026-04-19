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
          currentTurn: 'PLAYER1'
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative glass-panel w-full max-w-lg rounded-2xl border border-outline-variant/15 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[min(90dvh,750px)]">
        {/* Fixed Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h2 className="text-3xl font-extrabold font-headline tracking-tighter text-on-surface">Game Setup</h2>
              <p className="text-[10px] font-bold text-primary tracking-widest uppercase">
                {mode === 'AI' ? 'Challenge Aetheris' : 'Local Arena Duel'}
              </p>
            </div>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body (Hidden Scrollbar) */}
        <div className="flex-1 overflow-y-auto px-6 space-y-5 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {/* Board Size Section */}
          <section>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2 opacity-70 italic">Board Dimensions</label>
            <div className="grid grid-cols-2 gap-3">
              {[10, 15].map(size => (
                <button 
                  key={size}
                  onClick={() => setBoardSize(size)}
                  className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl border transition-all duration-300 ${boardSize === size ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'}`}
                >
                  <span className={`text-xl font-black font-headline mb-0.5 ${boardSize === size ? 'text-primary' : 'text-on-surface'}`}>{size} x {size}</span>
                  <span className="text-[10px] font-medium opacity-60 uppercase tracking-tighter">{size === 10 ? 'Standard' : 'Extended'}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Local Mode: Player Selectors */}
          {mode === 'LOCAL' && (
            <section className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
              <button 
                onClick={() => setActiveSelector('P1')}
                className={`relative p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${activeSelector === 'P1' ? 'bg-primary/20 border-primary shadow-lg scale-105 z-10' : 'bg-transparent border-transparent opacity-60 grayscale'}`}
              >
                <span className="text-[10px] font-black tracking-widest uppercase mb-1">Player 1</span>
                <span className="material-symbols-outlined text-3xl text-primary font-bold">{markers.find(m => m.id === p1Marker)?.icon}</span>
                {activeSelector === 'P1' && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-ping"></div>}
              </button>
              <button 
                onClick={() => setActiveSelector('P2')}
                className={`relative p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${activeSelector === 'P2' ? 'bg-cyan-500/20 border-cyan-500 shadow-lg scale-105 z-10' : 'bg-transparent border-transparent opacity-60 grayscale'}`}
              >
                <span className="text-[10px] font-black tracking-widest uppercase mb-1">Player 2</span>
                <span className="material-symbols-outlined text-3xl text-cyan-400 font-bold">{markers.find(m => m.id === p2Marker)?.icon}</span>
                {activeSelector === 'P2' && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-500 rounded-full animate-ping"></div>}
              </button>
            </section>
          )}

          {/* Marker Selection Grid */}
          <section>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2 opacity-70 italic">Select Marker</label>
            <div className="grid grid-cols-3 gap-2">
              {markers.map((marker) => {
                const isP1 = p1Marker === marker.id;
                const isP2 = p2Marker === marker.id && mode === 'LOCAL';
                const isTargeted = (mode === 'AI' && p1Marker === marker.id) || 
                                   (mode === 'LOCAL' && ((activeSelector === 'P1' && isP1) || (activeSelector === 'P2' && isP2)));
                const isDisabled = mode === 'LOCAL' && ((activeSelector === 'P1' && isP2) || (activeSelector === 'P2' && isP1));
                
                return (
                  <button
                    key={marker.id}
                    disabled={isDisabled}
                    onClick={() => handleMarkerSelect(marker.id)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all active:scale-95 group relative border-2 ${
                      isP1 ? 'border-primary bg-primary/20 text-primary' : 
                      isP2 ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400' : 
                      'bg-surface-container-highest/50 border-white/5 text-on-surface-variant hover:border-white/20'
                    } ${isDisabled ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
                  >
                    <span className={`material-symbols-outlined text-4xl ${isTargeted ? 'scale-110 font-bold' : 'opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all'}`}>
                      {marker.icon}
                    </span>
                    {/* P1 Badge */}
                    {isP1 && (
                      <div className="absolute top-1 left-1 bg-primary text-[8px] font-black px-1.5 rounded-md text-on-primary">P1</div>
                    )}
                    {/* P2 Badge */}
                    {isP2 && (
                      <div className="absolute top-1 right-1 bg-cyan-500 text-[8px] font-black px-1.5 rounded-md text-white">P2</div>
                    )}
                    {isTargeted && (
                      <div className={`absolute inset-0 rounded-2xl ring-2 animate-pulse ${isP2 ? 'ring-cyan-500/50' : 'ring-primary/50'}`}></div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* AI Specific Sections */}
          {mode === 'AI' && (
            <>
              <section>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2 opacity-70 italic">Select Difficulty</label>
                <div className="grid grid-cols-3 gap-3">
                  {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                    <button 
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`flex items-center justify-center py-3 px-2 rounded-xl border transition-all duration-300 ${difficulty === level ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'}`}
                    >
                      <span className="text-sm font-bold font-headline capitalize">{level.toLowerCase()}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-2 opacity-70 italic">Move First</label>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map(p => (
                    <button 
                      key={p}
                      onClick={() => setMoveFirst(p)}
                      className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl border transition-all duration-300 ${moveFirst === p ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'}`}
                    >
                      <span className="text-sm font-bold font-headline">{p === 1 ? 'You' : 'Aetheris'}</span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}
          
          {/* Bottom Padding for Body */}
          <div className="h-2"></div>
        </div>

        {/* Fixed Footer */}
        <div className="px-6 py-5 border-t border-white/5 relative bg-surface-container-low/40">
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-extrabold text-lg tracking-tight shadow-[0_8px_24px_rgba(179,161,255,0.3)] hover:shadow-[0_12px_32px_rgba(179,161,255,0.5)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Initializing...' : 'Start Game'}
          </button>
          <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-t from-surface-container-low/40 to-transparent pointer-events-none"></div>
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
      </div>
    </div>
  );
};

export default GameSetupModal;
