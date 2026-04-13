import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Circle, Trophy, ArrowLeft, RotateCcw } from 'lucide-react';
import { Navigation } from '../../components/Navigation.jsx';
import { Avatar } from '../../components/Avatar.jsx';
import { Button } from '../../components/Button.jsx';
import { useGameLogic } from './game.hook.js';
import { useAuthStore } from '../../store/authStore.js';
import { motion, AnimatePresence } from 'motion/react';

/**
 * GameView - The Ultimate TicTacToang Match Interface.
 * Real Logic: Consumes AuthStore (Layer 5) and GameService (Layer 4).
 */
export default function GameView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  
  // Game Configuration from URL
  const size = parseInt(searchParams.get('size') || '10');
  const gameType = window.location.pathname.includes('/ai') ? 'SINGLE' : 'LOCAL';
  
  // Logic Engine (Layer 3/4)
  const { 
    board, currentTurn, winner, winLine, isDraw, 
    isProcessingAI, resetGame, makeMove 
  } = useGameLogic(size, gameType, 'HARD', user?.id || 'GUEST', user?.username || 'Guest');


  // Coordinate Labels
  const letters = 'ABCDEFGHIJKLMNO'.split('').slice(0, size);

  const isWinningCell = (r, c) => {
    if (!winLine) return false;
    return winLine.some(cell => cell[0] === r && cell[1] === c);
  };

  const renderMarker = (val) => {
    if (!val) return null;
    return val === 'X' ? (
      <X size={24} className="text-coral drop-shadow-[0_0_8px_rgba(255,107,107,0.5)]" strokeWidth={3} />
    ) : (
      <Circle size={24} className="text-teal drop-shadow-[0_0_8px_rgba(0,201,177,0.5)]" strokeWidth={3} />
    );
  };

  return (
    <div className="min-h-screen bg-page text-text-primary overflow-x-hidden">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_240px] gap-8">
          
          {/* Player 1 Sidebar (Real User From Store) */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-6 flex flex-col h-fit">
            <Avatar src={user?.avatar} alt="Player 1" premium={user?.premium} size="lg" className="mx-auto" />
            <div className="text-center">
              <p className="font-orbitron font-bold text-xl text-gold">Player 1</p>
              <p className="text-text-secondary text-sm">{user?.username || 'Guest'}</p>
            </div>
            <div className="flex justify-center py-2 bg-page/50 rounded-lg">
              <X size={32} className="text-coral" strokeWidth={3} />
            </div>
            
            <AnimatePresence>
              {currentTurn === 'X' && !winner && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-coral/10 border border-coral/40 rounded-lg p-3 text-center"
                >
                  <p className="text-coral font-bold text-sm tracking-widest animate-pulse">YOUR TURN</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Game Arena (Center) */}
          <div className="flex flex-col items-center">
            <div className="inline-block">
              <div className="flex mb-2 ml-8">
                {letters.map((letter) => (
                  <div key={letter} className="w-10 h-6 flex items-center justify-center text-text-secondary text-xs font-mono">
                    {letter}
                  </div>
                ))}
              </div>

              <div className="flex">
                <div className="flex flex-col mr-2">
                  {Array.from({ length: size }, (_, i) => (
                    <div key={i} className="w-6 h-10 flex items-center justify-center text-text-secondary text-xs font-mono">
                      {i + 1}
                    </div>
                  ))}
                </div>

                <div className="bg-surface-elevated p-2 rounded-xl border border-border shadow-2xl relative">
                  <div className="grid gap-px bg-border/20">
                    {board.map((row, rIdx) => (
                      <div key={rIdx} className="flex">
                        {row.map((cell, cIdx) => (
                          <button
                            key={`${rIdx}-${cIdx}`}
                            onClick={() => makeMove(rIdx, cIdx)}
                            disabled={!!winner || !!cell || isProcessingAI}
                            className={`
                              w-10 h-10 flex items-center justify-center border border-border/10 transition-all relative
                              ${!cell && !winner ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'}
                              ${isWinningCell(rIdx, cIdx) ? 'bg-gold/20' : ''}
                            `}
                          >
                            <AnimatePresence>
                              {cell && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -45 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                >
                                  {renderMarker(cell)}
                                </motion.div>
                              )}
                            </AnimatePresence>
                            {isWinningCell(rIdx, cIdx) && (
                              <motion.div className="absolute inset-0 bg-gold/30 blur-sm z-0" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
                            )}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {isProcessingAI && (
                <div className="mt-4 flex items-center gap-3 text-gold/80 italic animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-gold animate-bounce" />
                  <span className="text-sm">AI is analyzing the board...</span>
                </div>
              )}

              <div className="mt-8 flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate('/dashboard')} className="border-border text-text-secondary hover:text-white">
                  <ArrowLeft size={18} className="mr-2" /> Exit Arena
                </Button>
                <Button variant="outline" onClick={() => resetGame()} className="border-border text-gold hover:bg-gold/10">
                  <RotateCcw size={18} className="mr-2" /> Restart Match
                </Button>
              </div>
            </div>
          </div>

          {/* Opponent Sidebar (Right) */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-6 flex flex-col h-fit">
            <Avatar src={null} alt="Opponent" size="lg" className="mx-auto" />
            <div className="text-center">
              <p className="font-orbitron font-bold text-xl text-teal">{gameType === 'SINGLE' ? 'AI BOT' : 'PLAYER 2'}</p>
              <p className="text-text-secondary text-sm">{gameType === 'SINGLE' ? 'Neural Network v4' : 'Local Rival'}</p>
            </div>
            <div className="flex justify-center py-2 bg-page/50 rounded-lg">
              <Circle size={32} className="text-teal" strokeWidth={3} />
            </div>

            <AnimatePresence>
              {currentTurn === 'O' && !winner && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-teal/10 border border-teal/40 rounded-lg p-3 text-center"
                >
                  <p className="text-teal font-bold text-sm tracking-widest animate-pulse">THINKING...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* WINNER OVERLAY (Logic Powered) */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] backdrop-blur-md"
          >
            <motion.div initial={{ scale: 0.5, y: 100 }} animate={{ scale: 1, y: 0 }} className="text-center">
              <Trophy size={120} className="text-gold mx-auto mb-8 animate-bounce" />
              <h2 className="text-7xl font-black font-orbitron text-gold text-gold-glow mb-4">
                {winner === 'X' ? 'VICTORY' : 'DEFEAT'}
              </h2>
              <p className="text-3xl font-orbitron tracking-widest text-white mb-12">
                {winner === 'X' ? `${user?.username} Wins!` : 'Arena Contested'}
              </p>
              
              <div className="flex gap-6 justify-center">
                <Button size="lg" onClick={() => resetGame()} className="bg-gold-gradient px-12 py-8 text-xl font-bold rounded-2xl">Play Again</Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/dashboard')} className="border-white/20 text-white px-12 py-8 text-xl font-bold rounded-2xl">Dashboard</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

