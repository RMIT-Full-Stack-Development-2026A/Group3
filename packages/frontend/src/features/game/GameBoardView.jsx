import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from './gameHook';
import Header from '../../shared/components/layout/Header';
import { useAuthStore } from '../../app/store/authStore';
import gameService from './gameService';

const GameBoardView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
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
      const config = {
        gameType: session.gameType || 'SINGLE',
        boardSize: session.boardSize,
        player1Marker: session.p1.marker,
        player2Marker: session.p2.marker,
        moveFirst: 'player', // Default to player for reset
        difficulty: session.difficulty || 'MEDIUM'
      };
      
      const res = await gameService.createSession(config);
      const newSessionId = res.data.sessionId || res.data._id || res.data.id;
      navigate(`/game/ai/${newSessionId}`);
      // The navigate might not trigger a re-mount if it's the same route pattern, 
      // so refresh is called just in case
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

  return (
    <div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary/30 overflow-x-hidden">
      <Header user={user} />

      <main className="pt-24 pb-10 px-4 lg:px-8">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Player 1 Stats Section (Left) */}
          <div className="xl:col-span-3 space-y-6">
            <div className={`glass-panel p-6 rounded-xl border transition-all duration-500 relative overflow-hidden group ${session?.currentTurn === 'PLAYER1' ? 'border-primary shadow-[0_0_30px_rgba(179,161,255,0.2)]' : 'border-outline-variant/10 shadow-2xl'}`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img 
                    alt="Player avatar" 
                    className={`w-14 h-14 rounded-lg bg-surface-container-high border ${session?.currentTurn === 'PLAYER1' ? 'border-primary' : 'border-outline-variant/30'}`}
                    src={session?.p1?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=P1"} 
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-surface"></div>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-violet-200">{session?.p1?.name || 'You'}</h3>
                  <p className="text-xs text-violet-400/70 font-semibold tracking-tighter uppercase">Rating: 2450 Elo</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="block text-[10px] text-violet-400 uppercase tracking-widest font-bold">Symbol</span>
                  <span className={`material-symbols-outlined text-3xl font-black text-primary ${session?.p1?.marker === 'CROSS' ? 'marker-glow-x' : 'marker-glow-o'}`}>
                    {getMarkerSymbol(session?.p1?.marker)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-violet-400 uppercase tracking-widest font-bold">Score</span>
                  <span className="text-3xl font-headline font-extrabold text-violet-200">0</span>
                </div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="space-y-3">
              <button 
                onClick={handleReset}
                className="w-full py-3 rounded-lg bg-primary text-on-primary font-headline font-bold shadow-[0_4px_15px_rgba(179,161,255,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2 group active:scale-95"
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

              <button className="w-full py-3 rounded-lg bg-surface-container-high text-violet-400/50 font-headline font-bold border border-outline-variant/20 cursor-not-allowed opacity-50 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">undo</span>
                Request Undo
              </button>
            </div>
          </div>

          {/* Game Board Section (Center) */}
          <div className="xl:col-span-6 flex flex-col items-center">
            <div className="mb-6 flex items-center gap-8 h-16">
              {session?.status === 'ACTIVE' ? (
                <div className="text-center animate-fade-in">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-primary/60 mb-1">
                    {session.currentTurn === 'PLAYER1' ? 'Your Turn' : "AI's Turn"}
                  </p>
                  <p className="text-2xl font-headline font-black text-primary tracking-tight">
                    {session.currentTurn === 'PLAYER1' ? 'AWAITING INPUT' : 'THINKING...'}
                  </p>
                </div>
              ) : (
                <div className="text-center animate-bounce">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-primary/60 mb-1">Status</p>
                  <p className="text-3xl font-headline font-black text-primary tracking-tight">
                    {session?.matchOutcome === 'WIN' ? 'VICTORY!' : session?.matchOutcome === 'LOSS' ? 'DEFEAT' : 'DRAW'}
                  </p>
                </div>
              )}
            </div>

            {/* Board Container */}
            <div className="glass-panel p-2 lg:p-4 rounded-2xl border border-outline-variant/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] w-full max-w-[700px] relative">
              <div 
                className="grid gap-1 bg-outline-variant/10 p-1 rounded-lg"
                style={{ 
                  gridTemplateColumns: `repeat(${session?.boardSize || 10}, minmax(0, 1fr))` 
                }}
              >
                {session?.board?.map((row, y) => (
                  row.map((cell, x) => (
                    <div 
                      key={`${y}-${x}`}
                      onClick={() => !cell && session?.status === 'ACTIVE' && session?.currentTurn === 'PLAYER1' && makeMove(y, x)}
                      className={`aspect-square bg-surface-container-low transition-all rounded-sm flex items-center justify-center text-sm md:text-lg lg:text-xl font-black relative overflow-hidden cursor-pointer hover:bg-surface-container-high active:scale-95 group ${isWinCell(y, x) ? 'bg-primary/20' : ''}`}
                    >
                      {cell && (
                        <span className={`material-symbols-outlined ${isWinCell(y, x) ? 'marker-winner-glow' : cell === session.p1.marker ? 'text-primary marker-glow-x' : 'text-secondary marker-glow-o opacity-80'}`}>
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
                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Match ID: #{session?.id?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Difficulty: {session?.difficulty || 'MEDIUM'}</span>
              </div>
            </div>
          </div>

          {/* Player 2 Stats Section (Right) */}
          <div className="xl:col-span-3 space-y-6 h-full">
            <div className={`glass-panel p-6 rounded-xl border transition-all duration-500 relative overflow-hidden group ${session?.currentTurn === 'PLAYER2' ? 'border-primary shadow-[0_0_30px_rgba(179,161,255,0.2)]' : 'border-outline-variant/10 shadow-2xl'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img 
                    alt="Opponent avatar" 
                    className={`w-14 h-14 rounded-lg bg-surface-container-high border ${session?.currentTurn === 'PLAYER2' ? 'border-primary' : 'border-outline-variant/30'}`}
                    src={session?.p2?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=AI"} 
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-surface"></div>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface-variant">{session?.p2?.name || 'Void_Walker'}</h3>
                  <p className="text-xs text-violet-400/70 font-semibold tracking-tighter uppercase">Rating: 2310 Elo</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="block text-[10px] text-violet-400 uppercase tracking-widest font-bold">Symbol</span>
                  <span className={`material-symbols-outlined text-3xl font-black text-secondary ${session?.p2?.marker === 'CROSS' ? 'marker-glow-x' : 'marker-glow-o'}`}>
                    {getMarkerSymbol(session?.p2?.marker)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] text-violet-400 uppercase tracking-widest font-bold">Score</span>
                  <span className="text-3xl font-headline font-extrabold text-violet-200">0</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="glass-panel p-4 rounded-xl border border-outline-variant/10 text-center">
                <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Spectators</p>
                <p className="text-2xl font-black text-violet-200">128</p>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-outline-variant/10 text-center">
                <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Match Strength</p>
                <p className="text-2xl font-black text-violet-200">Elite</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameBoardView;
