import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import gameService from './gameService';
import gameModel from './gameModel';
import { useAuthStore } from '../../app/store/authStore';
import { processLocalMove } from './localGameLogic';
import { getSocket } from '../Arena/arenaHook';
import { getBestMove } from '@tictactoang/shared/utils/aiLogicUtil';

export function useGame(sessionId) {
  const location = useLocation();
  const { user } = useAuthStore();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Local game state history
  const [moves, setMoves] = useState([]);  

  const isNewSession = sessionId === 'new' && location.state?.config;

  const fetchSession = useCallback(async () => {
    if (!sessionId || sessionId === 'new') return;
    try {
      const data = await gameService.getSession(sessionId);
      setSession(gameModel.formatSession(data.data));
    } catch (err) {
      setError(err.message || 'Failed to fetch game session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (isNewSession && !session) {
      const config = location.state.config;
      const size = config.boardSize || 10;
      console.log("Initializing local/AI session...");
      
      let initialBoard = Array(size).fill(null).map(() => Array(size).fill(null));
      let currentTurn = config.currentTurn || 'PLAYER1';
      let initialMoves = [];
      
      // If AI mode and AI moves first
      if (config.gameType === 'SINGLE' && config.moveFirst === 'bot') {
        const difficulty = config.difficulty || 'MEDIUM';
        const bestMove = getBestMove(initialBoard, difficulty, config.players.p2.marker, config.players.p1.marker);
        initialBoard[bestMove.row][bestMove.col] = config.players.p2.marker;
        initialMoves.push({
          x: bestMove.col,
          y: bestMove.row,
          marker: config.players.p2.marker,
          pId: null, // AI
          time: new Date()
        });
        currentTurn = 'PLAYER1';
      }

      setSession({
        ...config,
        id: config.gameType === 'SINGLE' ? 'ai-session' : 'local-session',
        board: initialBoard,
        currentTurn: currentTurn,
        p1: { ...config.players.p1, id: user?.id, name: user?.username, avatar: user?.avatarUrl },
        p2: { ...config.players.p2, id: null },
        status: 'ACTIVE'
      });
      setMoves(initialMoves);
      setLoading(false);
      return;
    }

    if (sessionId === 'new') return;

    fetchSession();
  }, [fetchSession, isNewSession, session?.id, session?.status, session?.currentTurn, session?.gameType, sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    const socket = getSocket();
    if (!socket) return;

    if (!socket.connected) {
      const token = useAuthStore.getState().token;
      socket.auth = { token };
      socket.connect();
    }

    const handleGameMove = (payload) => {
      if (!payload || !payload.session) return;
      const incoming = payload.session;
      if (incoming.sessionId !== sessionId) return;
      setSession(gameModel.formatSession(incoming));
    };

    socket.on('game:move', handleGameMove);

    return () => {
      socket.off('game:move', handleGameMove);
    };
  }, [sessionId]);

  const makeMove = useCallback(async (row, col) => {
    if (!session || session.status !== 'ACTIVE') return;
    
    // Handle Local or AI Move locally
    if (session.gameType === 'LOCAL' || session.gameType === 'SINGLE') {
      const playerResult = processLocalMove(session, moves, row, col);
      if (!playerResult) return;

      let finalSession = playerResult.updatedSession;
      let finalMoves = playerResult.updatedMoves;
      let finalJustEnded = playerResult.justEnded;

      // If it's SINGLE mode, and the game didn't just end, process AI move immediately
      if (session.gameType === 'SINGLE' && !finalJustEnded) {
        const difficulty = finalSession.difficulty || 'MEDIUM';
        const bestMove = getBestMove(finalSession.board, difficulty, finalSession.p2.marker, finalSession.p1.marker);
        
        const aiResult = processLocalMove(finalSession, finalMoves, bestMove.row, bestMove.col);
        if (aiResult) {
          finalSession = aiResult.updatedSession;
          finalMoves = aiResult.updatedMoves;
          finalJustEnded = aiResult.justEnded;
        }
      }
      
      setMoves(finalMoves);
      setSession(finalSession);

      // Sync if game ended
      if (finalJustEnded) {
        try {
          await gameService.syncLocalMatch({
            gameType: finalSession.gameType,
            boardSize: finalSession.boardSize,
            boardTheme: finalSession.boardTheme,
            p1Id: finalSession.p1.id,
            p1Name: finalSession.p1.name,
            p1Marker: finalSession.p1.marker,
            p2Name: finalSession.p2.name,
            p2Marker: finalSession.p2.marker,
            winnerId: finalSession.winnerId,
            winLine: finalSession.winLine,
            moves: finalMoves,
            status: finalSession.status,
            currentTurn: finalSession.currentTurn,
            boardState: finalSession.board
          });
        } catch (err) {
          console.error('Failed to sync match:', err);
        }
      }
      return;
    }

  }, [session, sessionId, user]);

  const reset = useCallback(() => {
    setSession(null);
    setMoves([]);
    setError(null);
    if (sessionId && sessionId !== 'new') {
      fetchSession();
    }
  }, [sessionId, fetchSession]);

  return { session, loading, error, makeMove, refresh: reset };
}
