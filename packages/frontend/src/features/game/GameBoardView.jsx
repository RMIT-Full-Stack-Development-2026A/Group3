import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from './gameHook';

import { getAvatarUrl } from '../../shared/utils/avatarUtil';
import gameService from './gameService';

const GameBoardView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, loading, error, makeMove, refresh } = useGame(sessionId);

  if (loading) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-white gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xl font-headline font-bold animate-pulse">Entering The Arena...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-rose-500 gap-6 p-4 text-center">
      <span className="material-symbols-outlined text-6xl">error_outline</span>
      <p className="text-2xl font-bold">{error}</p>
      <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold shadow-lg active:scale-95 transition-all">Back to Dashboard</button>
    </div>
  );

  const handleReset = async () => {
    if (!session) return;
    try {
      if (session.gameType === 'LOCAL') {
        const localSession = {
          gameType: 'LOCAL',
          boardSize: session.boardSize,
          players: {
            p1: { name: session.p1.name, marker: session.p1.marker },
            p2: { name: session.p2.name, marker: session.p2.marker }
          },
          status: 'ACTIVE',
          boardTheme: session.boardTheme,
          currentTurn: 'PLAYER1'
        };
        // Use replace: true to avoid filling history with reset states
        navigate('/game/local/new', { state: { config: localSession }, replace: true });
        refresh();
        return;
      }

      const config = {
        gameType: 'SINGLE',
        boardSize: session.boardSize,
        player1Marker: session.p1.marker,
        player2Marker: session.p2.marker,
        boardTheme: session.boardTheme,
        moveFirst: 'player', 
        difficulty: session.difficulty || 'MEDIUM'
      };
      
      const res = await gameService.createSession(config);
      const newSessionId = res.data.sessionId || res.data._id || res.data.id;
      navigate(`/game/ai/${newSessionId}`, { replace: true });
      refresh();
    } catch (err) {
      console.error('Failed to reset game:', err);
    }
  };

  const isWinCell = (row, col) => {
    return session?.winLine?.some(line => line.y === row && line.x === col);
  };

  const getMarkerSymbol = (marker) => {
    if (marker === 'CROSS') return 'close';
    if (marker === 'CIRCLE') return 'circle';
    if (marker === 'TRIANGLE') return 'change_history';
    if (marker === 'SQUARE') return 'square';
    if (marker === 'DIAMOND') return 'diamond';
    if (marker === 'STAR') return 'grade';
    return marker;
  };

  const isVN = session?.boardTheme === 'VIETNAM';
  const isSG = session?.boardTheme === 'SAIGON';

  return (
    <div className={`min-h-screen text-on-surface font-body selection:bg-primary/30 overflow-x-hidden relative ${
      isVN ? 'bg-vn-surface-dim' : isSG ? 'bg-sg-surface' : 'bg-background'
    }`}>
      
      {/* Background Layers */}
      {isVN && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img 
            alt="Background Landscape" 
            className="w-full h-full object-cover opacity-60" 
            src="https://lh3.googleusercontent.com/aida/ADBb0uhjs7THl6VsD5sYnrvF7wTlr7DQ7Re1w_-jSAk1Ao9Dw6s46RfDQ2G6d-KLk1cbeQ_4Nsg9vEqMtfOJ2e-m7o2gZzkVIcDJZ9uN0AgjncJKXxFEUxsXQNIdlwDZhVtQT_BZ1KnO7yj-yiySdYrTE7T6Qqc8esiWqNMheaIy1lYbir-X6fQbMBDzCHqXJj9PUuKDUlgzK3fcexXPqxVpVsqUyYWasHZVmII5_BWCKgH8U7GgvmApgxouBrBtHkHFiTzyR6lD7NZKKA"
          />
        </div>
      )}

      {isSG && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img 
            alt="Saigon Skyline" 
            className="w-full h-full object-cover opacity-60 mix-blend-screen" 
            src="https://lh3.googleusercontent.com/aida/ADBb0uh4H1sWlXSwdN0v_Nd2yWkIrwLCYNi6YaQBYD6Ll1vPsipXua3AMDg82EPHKD5oExZKHcuwqDVmSlm-wmOzacRBQWoTS9hmVFujLHK_EGSu2PJLI1VUSuCVyrLtD0hS20-30861VgzWz02KzFLPNBQ8HQkZ3uKp7BnVLKsqpGVTACMnkivwqOx-vZORflX7Mn8zBnNXqGtticJagAgi_sjJl9G0RyiYFvpJlNM-YA-GiwL5uabIU1Q4pUFAa92y32nHcNVaLIOYw_I"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/80"></div>
        </div>
      )}

      <div className="relative z-10">
        
        <main className="pt-24 pb-10 px-4 lg:px-8">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Player 1 Stats Section (Left) */}
            <div className="xl:col-span-3 space-y-6">
              <div className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden group ${
                isVN ? 'glass-panel-vn border-l-4 border-vn-tertiary' : 
                isSG ? 'glass-panel-saigon border-sg-cyan/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]' :
                session?.currentTurn === 'PLAYER1' ? 'glass-panel border-primary shadow-[0_0_30px_rgba(179,161,255,0.2)]' : 'glass-panel border-outline-variant/10 shadow-2xl'
              }`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 ${
                    isVN ? 'border-vn-tertiary' : isSG ? 'border-sg-cyan' : 'border-primary'
                  }`}>
                    <img alt="P1 Avatar" className="w-full h-full object-cover" src={getAvatarUrl(session?.p1?.avatar, 100)} />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-surface"></div>
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-cyan neon-text-cyan' : 'text-on-surface'}`}>
                      {session?.p1?.name || 'You'}
                    </h3>
                    <p className={`text-xs uppercase tracking-widest ${isVN ? 'text-vn-tertiary/60' : isSG ? 'text-sg-cyan/60' : 'text-on-surface/50'}`}>
                      Rating: 2450 ELO
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-xl ${isVN ? 'bg-black/40' : isSG ? 'bg-white/5 border border-sg-cyan/20' : 'bg-black/20'}`}>
                    <p className={`text-[10px] uppercase mb-1 ${isVN ? 'text-vn-tertiary/60' : isSG ? 'text-sg-cyan/60' : 'text-on-surface/40'}`}>Symbol</p>
                    <span className={`material-symbols-outlined text-2xl ${isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-cyan neon-text-cyan' : 'text-primary marker-glow-x'}`}>
                      {getMarkerSymbol(session?.p1?.marker)}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl ${isVN ? 'bg-black/40' : isSG ? 'bg-white/5 border border-sg-cyan/20' : 'bg-black/20'}`}>
                    <p className={`text-[10px] uppercase mb-1 ${isVN ? 'text-vn-tertiary/60' : isSG ? 'text-sg-cyan/60' : 'text-on-surface/40'}`}>Score</p>
                    <p className={`text-2xl font-bold font-headline ${isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-cyan' : 'text-on-surface'}`}>0</p>
                  </div>
                </div>
              </div>

              {/* Game Controls */}
              <div className="space-y-3">
                <button 
                  onClick={handleReset}
                  className={`w-full py-3 rounded-lg font-headline font-bold transition-all flex items-center justify-center gap-2 group active:scale-95 ${
                    isVN ? 'bg-vn-tertiary text-vn-on-tertiary shadow-lg shadow-vn-tertiary/20' : 
                    isSG ? 'bg-sg-cyan text-black font-bold uppercase shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 
                    'bg-primary text-on-primary shadow-[0_4px_15px_rgba(179,161,255,0.3)] hover:brightness-110'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">replay</span>
                  Reset Game
                </button>
                
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3 rounded-lg bg-surface-container-high text-violet-300 font-headline font-bold border border-outline-variant/30 hover:bg-surface-variant transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                  Back to Dashboard
                </button>
              </div>
            </div>

            {/* Game Board Section (Center) */}
            <div className="xl:col-span-6 flex flex-col items-center">
              <div className="mb-6 flex items-center gap-8 h-16">
                {session?.status === 'ACTIVE' ? (
                  <div className="text-center animate-fade-in">
                    <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-1 ${isVN ? 'text-vn-tertiary/60' : isSG ? 'text-sg-cyan/60' : 'text-primary/60'}`}>
                      {session.gameType === 'SINGLE' 
                        ? (session.currentTurn === 'PLAYER1' ? 'Your Turn' : "AI's Turn")
                        : (session.currentTurn === 'PLAYER1' ? "Player 1's Turn" : "Player 2's Turn")}
                    </p>
                    <p className={`text-2xl font-headline font-black tracking-tight ${isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-cyan neon-text-cyan' : 'text-primary'}`}>
                      {session.gameType === 'SINGLE' && session.currentTurn === 'PLAYER2' ? 'THINKING...' : 'AWAITING INPUT'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center animate-bounce">
                    <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-1 ${isVN ? 'text-vn-tertiary/60' : isSG ? 'text-sg-cyan/60' : 'text-primary/60'}`}>Status</p>
                    <p className={`text-3xl font-headline font-black tracking-tight ${isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-cyan neon-text-cyan' : 'text-primary'}`}>
                      {session?.gameType === 'SINGLE' 
                        ? (session?.matchOutcome === 'WIN' ? 'VICTORY!' : session?.matchOutcome === 'LOSS' ? 'DEFEAT' : 'DRAW')
                        : (session?.matchOutcome === 'WIN' ? 'P1 VICTORIOUS' : session?.matchOutcome === 'LOSS' ? 'P2 VICTORIOUS' : 'DRAW')
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Board Container */}
              <div className={`p-2 lg:p-4 relative transition-all duration-700 ${
                isVN ? 'glass-panel-vn rounded-none border-2 border-vn-tertiary/30' : 
                isSG ? 'bg-slate-900/80 border border-sg-cyan/50 shadow-[0_0_30px_rgba(34,211,238,0.1)]' : 
                'glass-panel rounded-2xl border border-outline-variant/10 shadow-[0_0_80px_rgba(0,0,0,0.5)]'
              } w-full max-w-[700px]`}>
                
                {/* Board Ornaments */}
                {isVN && (
                  <>
                    <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-vn-tertiary"></div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 border-t-2 border-r-2 border-vn-tertiary"></div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-2 border-l-2 border-vn-tertiary"></div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-vn-tertiary"></div>
                  </>
                )}

                <div 
                  className={`grid gap-1 p-1 rounded-lg relative ${isVN ? '' : 'bg-outline-variant/10'}`}
                  style={{ 
                    gridTemplateColumns: `repeat(${session?.boardSize || 10}, minmax(0, 1fr))` 
                  }}
                >
                  {/* Grid Layers */}
                  {isVN && <div className="absolute inset-0 bamboo-grid pointer-events-none opacity-40"></div>}
                  {isSG && (
                    <div className="absolute inset-0 pointer-events-none border border-sg-cyan/20"></div>
                  )}

                  {session?.board?.map((row, y) => (
                    row.map((cell, x) => (
                      <div 
                        key={`${y}-${x}`}
                        onClick={() => !cell && session?.status === 'ACTIVE' && makeMove(y, x)}
                        className={`aspect-square transition-all rounded-sm flex items-center justify-center text-sm md:text-lg lg:text-xl font-black relative overflow-hidden cursor-pointer active:scale-95 group ${
                          isVN ? 'hover:bg-vn-tertiary/10 border border-vn-tertiary/5' : 
                          isSG ? 'hover:bg-sg-cyan/5 border border-sg-cyan/20 shadow-[inset_0_0_10px_rgba(34,211,238,0.05)] bg-white/5' : 'bg-surface-container-low hover:bg-surface-container-high'
                        } ${isWinCell(y, x) ? (isVN ? 'bg-vn-tertiary/20' : isSG ? 'bg-sg-cyan/20' : 'bg-primary/20') : ''}`}
                      >
                        {cell && (
                          <span 
                            className={`material-symbols-outlined ${
                              isWinCell(y, x) ? 'marker-winner-glow' : 
                              cell === session.p1.marker 
                                ? (isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-cyan neon-text-cyan' : 'text-primary marker-glow-x') 
                                : (isVN ? 'text-vn-error' : isSG ? 'text-sg-magenta neon-text-magenta' : 'text-secondary marker-glow-o opacity-80')
                            }`}
                            style={isVN && cell === session.p1.marker ? { fontVariationSettings: '"FILL" 1' } : {}}
                          >
                            {getMarkerSymbol(cell)}
                          </span>
                        )}
                      </div>
                    ))
                  ))}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full border border-outline-variant/20">
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Match ID: #{session?.id ? session.id.slice(-8).toUpperCase() : 'LOCAL'}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">
                    {session?.gameType === 'SINGLE' ? `Difficulty: ${session?.difficulty || 'MEDIUM'}` : 'Local Match'}
                  </span>
                </div>
              </div>
            </div>

            {/* Player 2 Stats Section (Right) */}
            <div className="xl:col-span-3 space-y-6">
              <div className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden group ${
                isVN ? 'glass-panel-vn border-l-4 border-vn-error' : 
                isSG ? 'glass-panel-saigon border-sg-magenta/30 shadow-[0_0_20px_rgba(192,38,211,0.2)]' :
                session?.currentTurn === 'PLAYER2' ? 'glass-panel border-primary shadow-[0_0_30px_rgba(179,161,255,0.2)]' : 'glass-panel border-outline-variant/10 shadow-2xl'
              }`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 ${
                    isVN ? 'border-vn-error' : isSG ? 'border-sg-magenta' : 'border-primary'
                  }`}>
                    <img alt="P2 Avatar" className="w-full h-full object-cover" src={session?.p2?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=AI"} />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-surface"></div>
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isVN ? 'text-vn-error' : isSG ? 'text-sg-magenta neon-text-magenta' : 'text-on-surface'}`}>
                      {session?.gameType === 'SINGLE' ? (session?.p2?.name || 'Aetheris') : 'Player 2'}
                    </h3>
                    <p className={`text-xs uppercase tracking-widest ${isVN ? 'text-vn-error/60' : isSG ? 'text-sg-magenta/60' : 'text-on-surface/50'}`}>
                      Rating: {session?.gameType === 'SINGLE' ? '2310 Elo' : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-xl ${isVN ? 'bg-black/40' : isSG ? 'bg-white/5 border border-sg-magenta/20' : 'bg-black/20'}`}>
                    <p className={`text-[10px] uppercase mb-1 ${isVN ? 'text-vn-error/60' : isSG ? 'text-sg-magenta/60' : 'text-on-surface/40'}`}>Symbol</p>
                    <span className={`material-symbols-outlined text-2xl ${isVN ? 'text-vn-error' : isSG ? 'text-sg-magenta neon-text-magenta' : 'text-primary'}`}>
                      {getMarkerSymbol(session?.p2?.marker)}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl ${isVN ? 'bg-black/40' : isSG ? 'bg-white/5 border border-sg-magenta/20' : 'bg-black/20'}`}>
                    <p className={`text-[10px] uppercase mb-1 ${isVN ? 'text-vn-error/60' : isSG ? 'text-sg-magenta/60' : 'text-on-surface/40'}`}>Score</p>
                    <p className={`text-2xl font-bold font-headline ${isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-magenta' : 'text-on-surface'}`}>0</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className={`p-4 rounded-xl border text-center ${isVN ? 'glass-panel-vn border-vn-tertiary/20' : isSG ? 'glass-panel-saigon border-sg-cyan/20' : 'glass-panel border-outline-variant/10'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isVN ? 'text-vn-tertiary/60' : isSG ? 'text-sg-cyan/60' : 'text-violet-400'}`}>Spectators</p>
                  <p className={`text-2xl font-black ${isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-cyan' : 'text-violet-200'}`}>128</p>
                </div>
                <div className={`p-4 rounded-xl border text-center ${isVN ? 'glass-panel-vn border-vn-tertiary/20' : isSG ? 'glass-panel-saigon border-sg-cyan/20' : 'glass-panel border-outline-variant/10'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isVN ? 'text-vn-tertiary/60' : isSG ? 'text-sg-cyan/60' : 'text-violet-400'}`}>Match Strength</p>
                  <p className={`text-2xl font-black ${isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-cyan' : 'text-violet-200'}`}>Elite</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GameBoardView;
