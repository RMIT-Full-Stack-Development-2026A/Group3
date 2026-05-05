import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAvatarUrl } from '../../shared/utils/avatarUtil';
import replayModel from './replayModel';
import { useReplay } from './replayHook';

const getMarkerSymbol = (marker) => {
  if (marker === 'CROSS') return 'close';
  if (marker === 'CIRCLE') return 'circle';
  if (marker === 'TRIANGLE') return 'change_history';
  if (marker === 'SQUARE') return 'square';
  if (marker === 'DIAMOND') return 'diamond';
  if (marker === 'STAR') return 'grade';
  return marker;
};

const ReplayView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const {
    replay,
    board,
    loading,
    error,
    currentStep,
    totalMoves,
    isPlaying,
    play,
    pause,
    next,
    prev,
    reset,
    jumpToEnd,
    setStep
  } = useReplay(sessionId);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-white gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xl font-headline font-bold animate-pulse">Loading replay data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-rose-500 gap-6 p-4 text-center">
        <span className="material-symbols-outlined text-6xl">error_outline</span>
        <p className="text-2xl font-bold">{error}</p>
        <button
          onClick={() => navigate('/match-history')}
          className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold shadow-lg active:scale-95 transition-all"
        >
          Back to Match History
        </button>
      </div>
    );
  }

  const markers = replayModel.getPlayerMarkers(replay);
  const progress = totalMoves === 0 ? 0 : Math.min(100, Math.round((currentStep / totalMoves) * 100));
  const currentMove = currentStep > 0 ? replay?.moves?.[currentStep - 1] : null;
  const showWinningLine = Boolean(
    replay?.status === 'COMPLETED' &&
    replay?.winLine?.length > 0 &&
    currentStep >= totalMoves &&
    totalMoves > 0
  );

  return (
    <div className="min-h-screen text-on-surface font-body selection:bg-primary/30 overflow-x-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-surface/60 via-surface/80 to-surface"></div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 0%, rgba(179,161,255,0.2) 0%, rgba(10,8,18,0) 70%)'
          }}
        ></div>
      </div>

      <div className="relative z-10">
        <main className="pt-24 pb-24 px-6 max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
          <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 blur-2xl"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary shadow-[0_0_15px_rgba(179,161,255,0.3)]">
                  <img
                    alt="Player 1"
                    className="w-full h-full object-cover"
                    src={getAvatarUrl(null, 120)}
                  />
                </div>
                <div>
                  <h2 className="font-headline text-lg text-primary font-bold">
                    {replay?.players?.player1Name || 'Player 1'}
                  </h2>
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">
                    Marker {markers.p1}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center mt-4">
                <span className="text-4xl font-black text-primary/30">X</span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/20 blur-2xl"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-secondary shadow-[0_0_15px_rgba(214,188,244,0.3)]">
                  <img
                    alt="Player 2"
                    className="w-full h-full object-cover"
                    src={getAvatarUrl(null, 120)}
                  />
                </div>
                <div>
                  <h2 className="font-headline text-lg text-secondary font-bold">
                    {replay?.players?.player2Name || 'Player 2'}
                  </h2>
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-full">
                    Marker {markers.p2}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center mt-4">
                <span className="text-4xl font-black text-secondary/30">O</span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/20 space-y-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-on-surface-variant">
                <span>Replay Status</span>
                <span className="text-primary font-bold">{replay?.status || 'UNKNOWN'}</span>
              </div>
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-on-surface-variant">
                <span>Step</span>
                <span className="text-on-surface font-bold">{currentStep} / {totalMoves}</span>
              </div>
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-on-surface-variant">
                <span>Current</span>
                <span className="text-on-surface font-bold">
                  {currentMove ? `${currentMove.x},${currentMove.y}` : '--'}
                </span>
              </div>
            </div>
          </aside>

          <section className="col-span-12 lg:col-span-6">
            <div className="glass-panel p-4 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <div
                className="grid gap-1 bg-surface-container-low/60 p-2 rounded-xl"
                style={{
                  gridTemplateColumns: `repeat(${replay?.boardSize || 10}, minmax(0, 1fr))`
                }}
              >
                {board.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`${y}-${x}`}
                      className={`aspect-square border border-white/5 flex items-center justify-center text-lg font-black rounded-sm transition-all duration-300 ${
                        showWinningLine && replay?.winLine?.some((line) => line.x === x && line.y === y)
                          ? 'bg-primary/25 ring-1 ring-primary/70 shadow-[0_0_18px_rgba(179,161,255,0.45)]'
                          : 'bg-surface-container-low'
                      }`}
                    >
                      {cell && (
                        <span
                          className={`material-symbols-outlined ${
                            cell === markers.p1 ? 'text-primary marker-glow-x' : 'text-secondary marker-glow-o'
                          }`}
                          style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                          {getMarkerSymbol(cell)}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-6">

                <div className="flex justify-center items-center gap-6 flex-wrap">
                  <button
                    onClick={reset}
                    className="group flex flex-col items-center gap-1 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface-variant group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">first_page</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant group-hover:text-primary">Start</span>
                  </button>

                  <button
                    onClick={prev}
                    className="group flex flex-col items-center gap-1 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface-variant group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">fast_rewind</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant group-hover:text-primary">Back</span>
                  </button>

                  <button
                    onClick={isPlaying ? pause : play}
                    className="group flex flex-col items-center gap-1 scale-110"
                  >
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-primary text-on-primary shadow-[0_0_20px_rgba(179,161,255,0.4)] active:scale-95 transition-all">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                      {isPlaying ? 'Pause' : 'Play'}
                    </span>
                  </button>

                  <button
                    onClick={next}
                    className="group flex flex-col items-center gap-1 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface-variant group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">fast_forward</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant group-hover:text-primary">Next</span>
                  </button>

                  <button
                    onClick={jumpToEnd}
                    className="group flex flex-col items-center gap-1 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high text-on-surface-variant group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">last_page</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant group-hover:text-primary">End</span>
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-primary">Step {currentStep}</span>
                  <div className="flex-grow relative flex items-center h-6 group">
                    <div className="absolute w-full h-1.5 bg-surface-container-highest rounded-full pointer-events-none"></div>
                    <div
                      className="absolute h-1.5 bg-primary rounded-full shadow-[0_0_15px_rgba(179,161,255,0.6)] pointer-events-none"
                      style={{ width: `${progress}%` }}
                    ></div>
                    <div
                      className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_white] pointer-events-none transition-transform group-active:scale-125 group-hover:scale-110"
                      style={{ left: `calc(${progress}% - 8px)`, transform: 'translateY(-50%)' }}
                    ></div>
                    <input
                      type="range"
                      min="0"
                      max={totalMoves}
                      value={currentStep}
                      onChange={(e) => setStep(parseInt(e.target.value, 10))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0"
                    />
                  </div>
                  <span className="text-xs font-mono text-on-surface-variant">{totalMoves} steps</span>
                </div>
              </div>
            </div>
          </section>

          <aside className="col-span-12 lg:col-span-3">
            <div className="glass-panel h-full min-h-[520px] flex flex-col rounded-2xl overflow-hidden border border-outline-variant/20">
              <div className="p-4 border-b border-white/10 bg-white/5">
                <h3 className="font-headline text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">history</span>
                  Match Log
                </h3>
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-3 scrollbar-ethereal">
                {(replay?.moves || []).map((move, index) => {
                  const isP1 = String(move.playerId || '') === String(replay?.players?.player1Id || '');
                  const isActive = index + 1 === currentStep;
                  return (
                    <div
                      key={`${move.step}-${index}`}
                      className={`flex items-center justify-between text-xs p-3 rounded-lg border-l-[3px] transition-all duration-300 ${
                        isP1 ? 'border-primary' : 'border-secondary'
                      } ${
                        isActive 
                          ? isP1 
                            ? 'bg-primary/25 shadow-[0_0_15px_rgba(179,161,255,0.25)] scale-[1.02] transform' 
                            : 'bg-secondary/25 shadow-[0_0_15px_rgba(214,188,244,0.25)] scale-[1.02] transform'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isP1 ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                          <span className="font-bold text-[10px]">{isP1 ? 'X' : 'O'}</span>
                        </div>
                        <span className={isActive ? 'text-white font-semibold' : 'text-on-surface'}>Placed at [{move.x},{move.y}]</span>
                      </div>
                      <span className={isActive ? 'text-white font-mono font-bold' : 'text-on-surface-variant font-mono'}>#{move.step}</span>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={() => navigate('/match-history')}
                  className="w-full py-2 rounded-lg bg-surface-container-highest text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-surface transition-all"
                >
                  Back to History
                </button>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};

export default ReplayView;
