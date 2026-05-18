import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import gameService from './gameService';
import gameModel from './gameModel';
import { useAuthStore } from '../../app/store/authStore';
import { processLocalMove } from './localGameLogic';
import { getSocket } from '../Arena/arenaHook';

export function useGame(sessionId) {
  const location = useLocation();
  const { user } = useAuthStore();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moveError, setMoveError] = useState(null);
  
  // Local game state history
  const [localMoves, setLocalMoves] = useState([]);

  const isLocalNew = sessionId === 'new' && location.state?.config;

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
    if (isLocalNew && !session) {
      const config = location.state.config;
      const size = config.boardSize || 10;
      console.log("Initializing local session...");
      setSession({
        ...config,
        id: 'local-session',
        board: Array(size).fill(null).map(() => Array(size).fill(null)),
        currentTurn: config.currentTurn || 'PLAYER1',
        p1: { ...config.players.p1, id: user?.id || 'p1-local' },
        p2: { ...config.players.p2, id: null },
        status: 'ACTIVE'
      });
      setLoading(false);
      return;
    }

    // Not fetch if it's a local session
    if (sessionId === 'new') return;

    fetchSession();
    
    // Polling for AI move
    let interval;
    if (session && session.gameType === 'SINGLE' && session.status === 'ACTIVE' && session.currentTurn === 'PLAYER2') {
      interval = setInterval(fetchSession, 2000);
    }
    
    return () => clearInterval(interval);
  }, [fetchSession, isLocalNew, session?.id, session?.status, session?.currentTurn, session?.gameType, sessionId]);

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
    
    // Handle Local Move
    if (session.gameType === 'LOCAL') {
      const result = processLocalMove(session, localMoves, row, col);
      if (!result) return;

      const { updatedSession, updatedMoves, justEnded } = result;
      
      setLocalMoves(updatedMoves);
      setSession(updatedSession);

      // Sync if game ended
      if (justEnded) {
        try {
          await gameService.syncLocalMatch({
            gameType: 'LOCAL',
            boardSize: session.boardSize,
            boardTheme: session.boardTheme,
            p1Id: session.p1.id,
            p1Name: session.p1.name,
            p1Marker: session.p1.marker,
            p2Name: session.p2.name,
            p2Marker: session.p2.marker,
            winnerId: updatedSession.winnerId,
            winLine: updatedSession.winLine,
            moves: updatedMoves,
            status: updatedSession.status,
            currentTurn: updatedSession.currentTurn,
            boardState: updatedSession.board
          });
        } catch (err) {
          console.error('Failed to sync local match:', err);
        }
      }
      return;
    }

    // Handle AI Move
    try {
      const currentMarker = session.currentTurn === 'PLAYER1' ? session.p1.marker : session.p2.marker;
      const data = await gameService.makeMove(sessionId, { row, col, marker: currentMarker });
      setSession(gameModel.formatSession(data.data));
      setMoveError(null);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Invalid move';
      setMoveError(msg);
    }
  }, [session, sessionId, user]);

  const reset = useCallback(() => {
    setSession(null);
    setLocalMoves([]);
    setError(null);
    if (sessionId && sessionId !== 'new') {
      fetchSession();
    }
  }, [sessionId, fetchSession]);

  return { session, loading, error, moveError, makeMove, refresh: reset };
}
