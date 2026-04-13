import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameLogic } from './gameHook.js';
import { useAuthStore } from '../../store/authStore.js';

// Components
import Header from '../../components/layout/Header.jsx';
import PlayerCard from './components/PlayerCard.jsx';
import GameBoard from './components/GameBoard.jsx';

const GameView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { 
    board, 
    currentTurn, 
    winner, 
    winLine, 
    isProcessingAI, 
    makeMove,
    isLoading,
    sessionInfo
  } = useGameLogic(
    10, 
    user?.id || user?._id, 
    sessionId
  );

  // Auth Guard
  if (!user && !isLoading) {
    navigate('/login');
    return null;
  }

  // Loading State
  if (isLoading || !user) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center text-primary font-headline font-bold">
          LOADING ARENA...
        </div>
      </div>
    );
  }

  const playerMarker = sessionInfo?.player1Marker || 'CROSS';
  const opponentMarker = sessionInfo?.player2Marker || 'CIRCLE';

  return (
    <div className="bg-background text-on-surface font-body min-h-screen">
      <Header user={user} />

      <main className="pt-28 pb-10 px-4">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Players */}
          <div className="lg:col-span-3 space-y-6">
            <PlayerCard 
              name={user?.username || 'You'}
              marker={playerMarker}
              isActive={currentTurn === 'X' && !winner}
            />
            <PlayerCard 
              isOpponent={true}
              name={sessionInfo?.p2Name || 'AI'}
              marker={opponentMarker}
              isActive={currentTurn === 'O' && !winner}
            />
            <div className="mt-8">
               <button 
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 rounded-lg bg-surface-container-high text-on-surface font-bold border border-outline-variant/10"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Board */}
          <div className="lg:col-span-9 flex flex-col items-center">
            <div className="mb-4 h-8">
               {isProcessingAI && (
                 <p className="text-primary font-headline font-black animate-pulse uppercase tracking-widest">
                   AI is thinking...
                 </p>
               )}
               {winner && (
                 <p className="text-green-400 font-headline font-black uppercase tracking-widest text-2xl">
                   {winner === 'X' ? 'Victory!' : 'AI Wins!'}
                 </p>
               )}
            </div>

            <GameBoard 
              board={board} 
              winLine={winLine} 
              onCellClick={makeMove}
              currentMarker={currentTurn === 'X' ? playerMarker : opponentMarker}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default GameView;
