import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gameService from '../gameService';
import defaultBoardTheme from '../../../assets/images/boardThemes/default_theme.png';
import SaigonBoardTheme from '../../../assets/images/boardThemes/Saigon_skyline_theme.png';
import VietnamBoardTheme from '../../../assets/images/boardThemes/Vietnam_theme.png';

const GameSetupModal = ({ isOpen, mode = 'AI', onClose, onStartOnline }) => {
  if (!isOpen) return null;
  const navigate = useNavigate();
  const [boardSize, setBoardSize] = useState(10);
  const [loading, setLoading] = useState(false);
  
  // AI specific / P1 state
  const [p1Marker, setP1Marker] = useState('close');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [moveFirst, setMoveFirst] = useState(1);
  const [boardTheme, setBoardTheme] = useState('DEFAULT');
  
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
      let finalP2Marker = p2Marker;

      if (mode === 'AI') {
        if (p1Marker === 'circle') {
          const availableMarkers = markers.filter(m => m.id !== 'circle');
          const randomIdx = Math.floor(Math.random() * availableMarkers.length);
          finalP2Marker = availableMarkers[randomIdx].id;
        } else {
          finalP2Marker = 'circle';
        }
      }

      const p1 = markerMap[p1Marker];
      const p2 = markerMap[finalP2Marker];

      const config = {
        gameType: mode === 'AI' ? 'SINGLE' : 'LOCAL',
        boardSize: boardSize,
        player1Marker: p1,
        player2Marker: p2,
        boardTheme: boardTheme,
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
          boardTheme: boardTheme,
          currentTurn: moveFirst === 1 ? 'PLAYER1' : 'PLAYER2'
        };
        navigate('/game/local/new', { state: { config: localSession } });
        onClose();
        return;
      }

      if (mode === 'ONLINE') {
        const onlineSession = {
          gameType: 'ONLINE',
          boardSize,
          boardTheme,
          players: {
            p1: { name: 'Player 1', marker: p1 },
            p2: { name: 'Player 2', marker: p2 }
          },
          status: 'ACTIVE',
          currentTurn: moveFirst === 1 ? 'PLAYER1' : 'PLAYER2'
        };
        if (onStartOnline) {
          await onStartOnline(onlineSession);
        }
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
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop Dimmer */}
      <div className="absolute inset-0 bg-[#000000]/70 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Game Setup Modal */}
      <div className="relative glass-panel w-[95%] max-w-lg max-h-[90vh] rounded-2xl border border-outline-variant/15 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Header - Fixed */}
        <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-white/5">
          <h2 className="text-2xl font-extrabold font-headline tracking-tighter text-on-surface">Game Setup</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-2 hover:bg-white/5 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-ethereal space-y-6">
          
          {/* Section 1: Board Size */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Board Size</label>
            <div className="grid grid-cols-2 gap-4">
              {[10, 15].map(size => (
                <button 
                  key={size}
                  onClick={() => setBoardSize(size)}
                  className={`flex flex-col items-center justify-center py-4 px-4 rounded-xl border transition-all duration-300 ${
                    boardSize === size 
                    ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' 
                    : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'
                  }`}
                >
                  <span className={`text-xl font-black font-headline mb-1 ${boardSize === size ? 'text-primary' : 'text-on-surface'}`}>
                    {size} x {size}
                  </span>
                  <span className={`text-[9px] font-medium ${boardSize === size ? 'opacity-60' : 'opacity-40'}`}>
                    {size === 10 ? 'CLASSIC ARENA' : 'GRAND MASTER'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1.5: Select Board Theme */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Select Board Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {['DEFAULT', 'SAIGON', 'VIETNAM'].map(theme => {
                const imgUrls = {
                  'DEFAULT': defaultBoardTheme,
                  'SAIGON': SaigonBoardTheme,
                  'VIETNAM': VietnamBoardTheme
                };
                return (
                  <button 
                    key={theme}
                    onClick={() => setBoardTheme(theme)}
                    className={`flex flex-col gap-2 p-1.5 rounded-xl border transition-all duration-300 group ${
                      boardTheme === theme 
                      ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' 
                      : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'
                    }`}
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden relative border border-outline-variant/10">
                      <img alt={`${theme} Theme`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={imgUrls[theme]}/>
                    </div>
                    <span className={`text-[9px] font-bold font-headline text-center uppercase tracking-tighter ${boardTheme === theme ? 'text-primary' : ''}`}>{theme}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Section 2: Select Marker */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-primary">Select Marker</label>
              {(mode === 'LOCAL' || mode === 'ONLINE') && (
                <div className="flex p-1 bg-surface-container-highest/50 rounded-lg border border-white/5">
                  {['P1', 'P2'].map(sel => (
                    <button 
                      key={sel}
                      onClick={() => setActiveSelector(sel)}
                      className={`px-3 py-1 rounded-md text-[9px] font-black tracking-widest transition-all duration-300 ${
                        activeSelector === sel 
                        ? (sel === 'P1' ? 'bg-primary text-on-primary' : 'bg-cyan-500 text-white') 
                        : 'text-on-surface/40 hover:text-on-surface/70'
                      }`}
                    >
                      {sel === 'P1' ? 'PLAYER 1' : 'PLAYER 2'}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-6 gap-2">
              {markers.map((marker) => {
                const isP1 = p1Marker === marker.id;
                const isP2 = p2Marker === marker.id;
                const isActive = (mode === 'AI' && isP1) || 
                                 ((mode === 'LOCAL' || mode === 'ONLINE') && ((activeSelector === 'P1' && isP1) || (activeSelector === 'P2' && isP2)));
                const isDisabled = (mode === 'LOCAL' || mode === 'ONLINE') && ((activeSelector === 'P1' && isP2) || (activeSelector === 'P2' && isP1));
                
                return (
                  <button
                    key={marker.id}
                    disabled={isDisabled}
                    onClick={() => handleMarkerSelect(marker.id)}
                    className={`aspect-square flex items-center justify-center rounded-lg transition-all active:scale-95 group relative border ${
                      isActive 
                      ? 'bg-linear-to-br from-primary to-primary-container border-transparent text-on-primary marker-glow' 
                      : 'bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant hover:text-primary'
                    } ${isDisabled ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
                  >
                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                      {marker.icon}
                    </span>
                    {(mode === 'LOCAL' || mode === 'ONLINE') && (
                      <>
                        {isP1 && <div className="absolute -top-1 -left-1 bg-primary text-[6px] font-black px-1 rounded shadow-sm text-on-primary">P1</div>}
                        {isP2 && <div className="absolute -top-1 -right-1 bg-cyan-500 text-[6px] font-black px-1 rounded shadow-sm text-white">P2</div>}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Select Difficulty (AI Only) */}
          {mode === 'AI' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Select Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {['EASY', 'MEDIUM', 'HARD'].map((level) => (
                  <button 
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`flex items-center justify-center py-3 px-2 rounded-xl border transition-all duration-300 ${
                      difficulty === level 
                      ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' 
                      : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'
                    }`}
                  >
                    <span className="text-sm font-bold font-headline capitalize">{level.toLowerCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Move First */}
          {(mode === 'AI' || mode === 'LOCAL' || mode === 'ONLINE') && (
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
                    className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl border transition-all duration-300 active:scale-95 ${
                      isActive 
                      ? 'border-primary text-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.2)]' 
                      : 'border-outline-variant/30 text-on-surface/60 hover:bg-surface-variant'
                    }`}
                  >
                    <span className={`text-sm font-bold font-headline ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          )}

        </div>

        {/* Footer - Fixed */}
        <div className="p-6 pt-2 border-t border-white/5 bg-surface/50 backdrop-blur-md">
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-extrabold text-lg tracking-tight shadow-[0_8px_24px_rgba(179,161,255,0.3)] hover:shadow-[0_12px_32px_rgba(179,161,255,0.5)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Initializing...' : (mode === 'ONLINE' ? 'Create Room' : 'Start Game')}
          </button>
          {/* Bottom decorative glass accent */}
          <div className="mt-4 h-1 w-24 mx-auto rounded-full bg-primary/20"></div>
        </div>

        {/* Bottom decorative glass accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-transparent via-primary/40 to-transparent"></div>
      </div>
    </div>
  );

};

export default GameSetupModal;
