import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { ArrowCounterClockwise, ArrowLeft, WarningCircle, ChatCircleDots, CaretDown } from '@phosphor-icons/react';
import { useGame } from './gameHook';
import { useAuthStore } from '../../app/store/authStore';
import { useMediaQuery } from '../../shared/utils/useMediaQuery';
import ChatView from './components/ChatView';

import { getAvatarUrl } from '../../shared/utils/avatarUtil';
import VietnamBoardTheme from '../../assets/images/boardThemes/Vietnam_theme.png';
import SaigonBoardTheme from '../../assets/images/boardThemes/Saigon_skyline_theme.png';

const getAIName = (difficulty) => ({
  EASY: 'Havoc',
  MEDIUM: 'Berserker',
  HARD: 'Mayhem'
}[difficulty]);

const GameBoardView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { session, loading, error, roomNotice, makeMove, refresh, chatMessages, sendMessage, moves } = useGame(sessionId);
  const prefersReducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1280px)');

  // Chat drawer (below xl): unread = messages that arrived while it was closed
  const [chatOpen, setChatOpen] = useState(false);
  const [seenCount, setSeenCount] = useState(0);
  const unreadCount = chatOpen ? 0 : Math.max(0, chatMessages.length - seenCount);
  const toggleChat = () => {
    setSeenCount(chatMessages.length);
    setChatOpen((open) => !open);
  };

  // Per-visit scoreboard: count a win when a game goes ACTIVE -> finished (adjust-state-during-render)
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [prevStatus, setPrevStatus] = useState(null);
  const currentStatus = session?.status ?? null;
  if (currentStatus !== prevStatus) {
    setPrevStatus(currentStatus);
    if (prevStatus === 'ACTIVE' && currentStatus && currentStatus !== 'ACTIVE' && currentStatus !== 'ABORTED') {
      let side = null;
      if (session.gameType === 'ONLINE') {
        side = session.winnerId && session.winnerId === session.p1?.id ? 'p1'
          : session.winnerId && session.winnerId === session.p2?.id ? 'p2' : null;
      } else {
        side = session.matchOutcome === 'WIN' ? 'p1' : session.matchOutcome === 'LOSS' ? 'p2' : null;
      }
      if (side) setScores((s) => ({ ...s, [side]: s[side] + 1 }));
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-white gap-4">
      <div className="w-12 h-12 border-4 border-volt border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xl font-headline font-bold animate-pulse">Entering The Arena…</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-rose-500 gap-6 p-4 text-center">
      <WarningCircle size={56} weight="bold" aria-hidden="true" />
      <p className="text-2xl font-bold">{error}</p>
      <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-volt text-volt-ink rounded-lg font-bold shadow-lg active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface">Back to Dashboard</button>
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
          currentTurn: session.initialTurn,
          initialTurn: session.initialTurn
        };
        navigate('/game/local/new', { state: { config: localSession }, replace: true });
        refresh();
        return;
      }

      const aiSession = {
        gameType: 'SINGLE',
        boardSize: session.boardSize,
        players: {
          p1: { name: session.p1.name, marker: session.p1.marker },
          p2: { name: session.p2.name, marker: session.p2.marker }
        },
        status: 'ACTIVE',
        boardTheme: session.boardTheme,
        currentTurn: 'PLAYER1',
        difficulty: session.difficulty,
        moveFirst: 'player'
      };
      navigate('/game/ai/new', { state: { config: aiSession }, replace: true });
      refresh();
    } catch (err) {
      console.error('Failed to reset game:', err);
    }
  };

  const isWinCell = (row, col) => {
    return session?.winLine?.some(line => line.y === row && line.x === col);
  };

  const lastMove = session?.lastMove || (moves && moves.length > 0 ? moves[moves.length - 1] : null);

  const getMarkerSymbol = (marker) => {
    switch (marker) {
      case 'CROSS': return 'close';
      case 'CIRCLE': return 'circle';
      case 'TRIANGLE': return 'change_history';
      case 'SQUARE': return 'square';
      case 'DIAMOND': return 'diamond';
      case 'STAR': return 'grade';
      default: return marker;
    }
  };

  const getMarkerName = (marker) => {
    switch (marker) {
      case 'CROSS': return 'X';
      case 'CIRCLE': return 'Circle';
      case 'TRIANGLE': return 'Triangle';
      case 'SQUARE': return 'Square';
      case 'DIAMOND': return 'Diamond';
      case 'STAR': return 'Star';
      default: return marker;
    }
  };

  const isVN = session?.boardTheme === 'VIETNAM';
  const isSG = session?.boardTheme === 'SAIGON';
  const isFinished = session?.status && session.status !== 'ACTIVE' && session.status !== 'WAITING';
  const isLive = session?.status === 'ACTIVE';
  const hasRealSessionId = /^[a-f0-9]{24}$/i.test(session?.id || '');

  const turnText = session?.status === 'WAITING'
    ? 'ARENA LOADING'
    : (session?.gameType === 'SINGLE' && session?.currentTurn === 'PLAYER2' ? 'THINKING…' : 'AWAITING INPUT');

  const outcomeText = session?.status === 'ABORTED'
    ? 'MATCH ABORTED'
    : session?.gameType === 'SINGLE'
    ? (session?.matchOutcome === 'WIN' ? 'YOU WIN!' : session?.matchOutcome === 'LOSS' ? 'YOU LOSE!' : 'DRAW')
    : session?.gameType === 'LOCAL'
    ? (session?.matchOutcome === 'WIN' ? 'P1 VICTORY' : session?.matchOutcome === 'LOSS' ? 'P2 VICTORIOUS' : 'DRAW')
    : (session?.winnerId === session?.p1?.id ? `${session?.p1.name} WINS` : `${session?.p2.name} WINS`);

  return (
    <div className={`min-h-screen text-on-surface font-body selection:bg-volt selection:text-volt-ink overflow-x-hidden relative ${isVN ? 'bg-vn-surface-dim' : isSG ? 'bg-sg-surface' : 'bg-background'
      }`}>

      {/* Background Layers */}
      {isVN && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            alt="Background Landscape"
            className="w-full h-full object-cover opacity-60"
            src={VietnamBoardTheme}
          />
        </div>
      )}

      {isSG && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <img
            alt="Saigon Skyline"
            className="w-full h-full object-cover opacity-60 mix-blend-screen"
            src={SaigonBoardTheme}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/80"></div>
        </div>
      )}

      <div className="relative z-10">

        <main className="pt-24 pb-40 px-4 lg:px-8">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

            {/* Player 1 Stats Section (Left) */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="order-2 xl:order-none xl:col-span-3 space-y-6"
            >
              <motion.div
                animate={!isVN && !isSG && isLive && session?.currentTurn === 'PLAYER1' ? { scale: 1.03 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden group ${isVN ? 'glass-panel-vn border-l-4 border-vn-tertiary' :
                  isSG ? 'glass-panel-saigon border-sg-cyan/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]' :
                    isLive && session?.currentTurn === 'PLAYER1' ? 'glass-panel border-volt shadow-[0_0_30px_rgba(195,255,74,0.25)]' : 'glass-panel border-outline-variant/10 shadow-2xl'
                  }`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 ${isVN ? 'border-vn-tertiary' : isSG ? 'border-sg-cyan' : 'border-volt'
                    }`}>
                    <img alt="P1 Avatar" className="w-full h-full object-cover" width="56" height="56" src={getAvatarUrl(session?.p1?.avatar, 100, session?.p1?.name)} />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-surface" aria-hidden="true"></div>
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-cyan neon-text-cyan' : 'text-on-surface'}`}>
                      {session?.p1?.name || 'You'}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-xl ${isVN ? 'bg-black/40' : isSG ? 'bg-white/5 border border-sg-cyan/20' : 'bg-black/20'}`}>
                    <p className={`text-[10px] uppercase mb-1 ${isVN ? 'text-vn-tertiary/60' : isSG ? 'text-sg-cyan/60' : 'text-on-surface/40'}`}>Symbol</p>
                    <span className={`material-symbols-outlined text-2xl ${isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-cyan neon-text-cyan' : 'text-volt marker-glow-x'}`} aria-label={getMarkerName(session?.p1?.marker)}>
                      {getMarkerSymbol(session?.p1?.marker)}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl ${isVN ? 'bg-black/40' : isSG ? 'bg-white/5 border border-sg-cyan/20' : 'bg-black/20'}`}>
                    <p className={`text-[10px] uppercase mb-1 ${isVN ? 'text-vn-tertiary/60' : isSG ? 'text-sg-cyan/60' : 'text-on-surface/40'}`}>Score</p>
                    <p className={`text-2xl font-bold font-headline ${isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-cyan' : 'text-on-surface'}`}>{scores.p1}</p>
                  </div>
                </div>
              </motion.div>

              {/* Game Controls */}
              <div className="space-y-3">
                {session?.gameType !== 'ONLINE' && (
                  <button
                    onClick={handleReset}
                    className={`w-full py-3 rounded-lg font-headline font-bold transition-all flex items-center justify-center gap-2 group active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${isVN ? 'bg-vn-tertiary text-vn-on-tertiary shadow-lg shadow-vn-tertiary/20 focus-visible:ring-vn-tertiary/60' :
                      isSG ? 'bg-sg-cyan text-black font-bold uppercase shadow-[0_0_15px_rgba(34,211,238,0.4)] focus-visible:ring-sg-cyan/60' :
                        'bg-volt text-volt-ink shadow-[0_4px_15px_rgba(195,255,74,0.3)] hover:brightness-110 focus-visible:ring-volt/60'
                    }`}>
                    <ArrowCounterClockwise size={20} weight="bold" aria-hidden="true" className="group-hover:rotate-180 transition-transform duration-500" />
                    Reset Game
                  </button>
                )}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3 rounded-lg bg-surface-container-high text-volt font-headline font-bold border border-outline-variant/30 hover:bg-surface-variant transition-all flex items-center justify-center gap-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <ArrowLeft size={20} weight="bold" aria-hidden="true" />
                  Back to Dashboard
                </button>
              </div>

              {/* Chat Panel */}
              {session?.gameType === 'ONLINE' && isDesktop && (
                <div className="mt-6">
                  <ChatView
                    messages={chatMessages}
                    onSendMessage={sendMessage}
                    currentUser={user}
                    opponentName={session?.p2?.name || 'Opponent'}
                    isLive={isLive}
                  />
                </div>
              )}
            </motion.div>


            {/* Game Board Section (Center) */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="order-1 xl:order-none xl:col-span-6 flex flex-col items-center"
            >
              <div className="mb-6 flex items-center gap-8 h-16" role="status" aria-live="polite">
                {session?.status === 'ACTIVE' || session?.status === 'WAITING' ? (
                  <div className="text-center">
                    <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-1 ${isVN ? 'text-vn-tertiary/60' : isSG ? 'text-sg-cyan/60' : 'text-volt/60'}`}>
                      {session?.status === 'WAITING'
                        ? 'Waiting for opponent'
                        : (session.gameType === 'SINGLE'
                          ? (session.currentTurn === 'PLAYER1' ? 'Your Turn' : `${getAIName(session.difficulty)}'s Turn`)
                          : (session.currentTurn === 'PLAYER1' ? `${session?.p1.name}'s Turn` : `${session?.p2.name}'s Turn`))}
                    </p>
                    <p className={`text-2xl font-headline font-black tracking-tight ${isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-cyan neon-text-cyan' : 'text-volt'}`}>
                      {turnText}
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center"
                  >
                    <p className={`text-[10px] uppercase font-black tracking-[0.2em] mb-1 ${isVN ? 'text-vn-tertiary/60' : isSG ? 'text-sg-cyan/60' : 'text-volt/60'}`}>Status</p>
                    <p className={`text-3xl font-headline font-black tracking-tight ${isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-cyan neon-text-cyan' : 'text-volt'}`}>
                      {outcomeText}
                    </p>
                    {roomNotice && (
                      <p className="mt-3 max-w-md text-sm font-semibold text-rose-300">
                        {roomNotice}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Board Container */}
              <div className={`p-2 lg:p-4 relative transition-all duration-700 ${isVN ? 'glass-panel-vn rounded-none border-2 border-vn-tertiary/30' :
                isSG ? 'bg-slate-900/80 border border-sg-cyan/50 shadow-[0_0_30px_rgba(34,211,238,0.1)]' :
                  'glass-panel rounded-2xl border border-outline-variant/10 shadow-[0_0_80px_rgba(0,0,0,0.5)]'
                } w-full max-w-[min(700px,max(320px,calc(100dvh-20rem)))]`}>

                {/* Board Ornaments */}
                {isVN && (
                  <>
                    <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-vn-tertiary" aria-hidden="true"></div>
                    <div className="absolute -top-4 -right-4 w-12 h-12 border-t-2 border-r-2 border-vn-tertiary" aria-hidden="true"></div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-2 border-l-2 border-vn-tertiary" aria-hidden="true"></div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-vn-tertiary" aria-hidden="true"></div>
                  </>
                )}

                {(session?.boardSize || 10) > 10 && (
                  <p className="sm:hidden mb-2 text-center text-[10px] uppercase tracking-widest text-on-surface/50">Swipe sideways to see the whole board</p>
                )}

                <div className="overflow-x-auto scrollbar-ethereal">
                <div
                  role="grid"
                  aria-label="Tic-tac-toe board"
                  className={`grid gap-1 p-1 rounded-lg relative ${isVN ? '' : 'bg-outline-variant/10'}`}
                  style={{
                    gridTemplateColumns: `repeat(${session?.boardSize || 10}, minmax(0, 1fr))`,
                    minWidth: `${(session?.boardSize || 10) * 28}px`
                  }}
                >
                  {/* Grid Layers */}
                  {isVN && <div className="absolute inset-0 bamboo-grid pointer-events-none opacity-40"></div>}
                  {isSG && (
                    <div className="absolute inset-0 pointer-events-none border border-sg-cyan/20"></div>
                  )}

                  {session?.board?.map((row, y) => (
                    row.map((cell, x) => {
                      const cellEmpty = !cell;
                      const canPlay = cellEmpty && session?.status === 'ACTIVE';
                      const cellLabel = cell
                        ? `Row ${y + 1}, column ${x + 1}, ${cell === session.p1.marker ? getMarkerName(session.p1.marker) : getMarkerName(session.p2.marker)}`
                        : `Row ${y + 1}, column ${x + 1}, empty`;
                      return (
                        <button
                          key={`${y}-${x}`}
                          type="button"
                          role="gridcell"
                          onClick={() => canPlay && makeMove(y, x)}
                          disabled={!canPlay}
                          aria-label={cellLabel}
                          className={`aspect-square transition-all rounded-sm flex items-center justify-center text-sm md:text-lg lg:text-xl font-black relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60 focus-visible:z-20 ${canPlay ? 'cursor-pointer active:scale-95' : 'cursor-default'} ${isVN ? 'hover:bg-vn-tertiary/10 border border-vn-tertiary/5' :
                            isSG ? 'hover:bg-sg-cyan/5 border border-sg-cyan/20 shadow-[inset_0_0_10px_rgba(34,211,238,0.05)] bg-white/5' : 'bg-surface-container-low hover:bg-surface-container-high'
                            } ${isWinCell(y, x) ? (isVN ? 'bg-vn-tertiary/20' : isSG ? 'bg-sg-cyan/20' : 'bg-volt/20') : ''} ${lastMove?.y === y && lastMove?.x === x ? 'bg-white/20 ring-2 ring-white/50 shadow-[inset_0_0_20px_rgba(255,255,255,0.4)] z-10' : ''}`}
                        >
                          {cell && (
                            <motion.span
                              initial={prefersReducedMotion ? false : { scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                              className={`material-symbols-outlined ${isWinCell(y, x) ? 'marker-winner-glow' :
                                cell === session.p1.marker
                                  ? (isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-cyan neon-text-cyan' : 'text-volt marker-glow-x')
                                  : (isVN ? 'text-vn-error-text' : isSG ? 'text-sg-magenta neon-text-magenta' : 'text-secondary marker-glow-o opacity-80')
                                }`}
                              style={isVN && cell === session.p1.marker ? { fontVariationSettings: '"FILL" 1' } : {}}
                              aria-hidden="true"
                            >
                              {getMarkerSymbol(cell)}
                            </motion.span>
                          )}
                        </button>
                      );
                    })
                  ))}
                </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {hasRealSessionId && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full border border-outline-variant/20">
                    <span className="text-xs font-bold text-volt uppercase tracking-widest">Match ID: #{session.id.slice(-8).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-4 py-2 bg-volt/10 rounded-full border border-volt/20">
                  <span className="text-xs font-bold text-volt uppercase tracking-widest">
                    {session?.gameType === 'SINGLE' ? `Difficulty: ${getAIName(session?.difficulty)}` : session?.gameType === 'ONLINE' ? 'Online Match' : 'Local Match'}
                  </span>
                </div>
              </div>

              {/* Chat drawer (below xl; on desktop chat lives in the left column) */}
              {session?.gameType === 'ONLINE' && !isDesktop && (
                <div className="mt-6 w-full max-w-[700px]">
                  <button
                    type="button"
                    onClick={toggleChat}
                    aria-expanded={chatOpen}
                    aria-controls="chat-drawer"
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl glass-panel border border-outline-variant/10 text-volt font-headline font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60"
                  >
                    <span className="flex items-center gap-2">
                      <ChatCircleDots size={20} weight="bold" aria-hidden="true" />
                      Chat
                      {unreadCount > 0 && (
                        <span className="min-w-5 px-1.5 rounded-full bg-volt text-volt-ink text-[11px] leading-5 text-center">
                          {unreadCount}<span className="sr-only"> unread messages</span>
                        </span>
                      )}
                    </span>
                    <CaretDown size={18} weight="bold" aria-hidden="true" className={`transition-transform ${chatOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {chatOpen && (
                    <div id="chat-drawer" className="mt-3">
                      <ChatView
                        messages={chatMessages}
                        onSendMessage={sendMessage}
                        currentUser={user}
                        opponentName={session?.p2?.name || 'Opponent'}
                        isLive={isLive}
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Player 2 Stats Section (Right) */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="order-3 xl:order-none xl:col-span-3 space-y-6"
            >
              <motion.div
                animate={!isVN && !isSG && isLive && session?.currentTurn === 'PLAYER2' ? { scale: 1.03 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden group ${isVN ? 'glass-panel-vn border-l-4 border-vn-error' :
                isSG ? 'glass-panel-saigon border-sg-magenta/30 shadow-[0_0_20px_rgba(192,38,211,0.2)]' :
                  isLive && session?.currentTurn === 'PLAYER2' ? 'glass-panel border-volt shadow-[0_0_30px_rgba(195,255,74,0.25)]' : 'glass-panel border-outline-variant/10 shadow-2xl'
                }`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 ${isVN ? 'border-vn-error' : isSG ? 'border-sg-magenta' : 'border-volt'
                    }`}>
                    <img alt="P2 Avatar" className="w-full h-full object-cover" width="56" height="56" src={session?.p2?.avatar ? getAvatarUrl(session?.p2?.avatar, 100) : (session?.gameType === 'SINGLE' ? "https://api.dicebear.com/7.x/bottts/svg?seed=AI" : `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.p2?.name || 'Player2'}`)} />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-surface" aria-hidden="true"></div>
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isVN ? 'text-vn-error-text' : isSG ? 'text-sg-magenta neon-text-magenta' : 'text-on-surface'}`}>
                      {session?.gameType === 'SINGLE' ? getAIName(session?.difficulty) : (session?.p2?.name)}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-xl ${isVN ? 'bg-black/40' : isSG ? 'bg-white/5 border border-sg-magenta/20' : 'bg-black/20'}`}>
                    <p className={`text-[10px] uppercase mb-1 ${isVN ? 'text-vn-error-text/80' : isSG ? 'text-sg-magenta/60' : 'text-on-surface/40'}`}>Symbol</p>
                    <span className={`material-symbols-outlined text-2xl ${isVN ? 'text-vn-error-text' : isSG ? 'text-sg-magenta neon-text-magenta' : 'text-volt'}`} aria-label={getMarkerName(session?.p2?.marker)}>
                      {getMarkerSymbol(session?.p2?.marker)}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl ${isVN ? 'bg-black/40' : isSG ? 'bg-white/5 border border-sg-magenta/20' : 'bg-black/20'}`}>
                    <p className={`text-[10px] uppercase mb-1 ${isVN ? 'text-vn-error-text/80' : isSG ? 'text-sg-magenta/60' : 'text-on-surface/40'}`}>Score</p>
                    <p className={`text-2xl font-bold font-headline ${isVN ? 'text-vn-tertiary' : isSG ? 'text-sg-magenta' : 'text-on-surface'}`}>{scores.p2}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GameBoardView;
