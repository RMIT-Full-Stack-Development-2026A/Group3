import { useState, useEffect, useCallback } from 'react';
import gameService from './gameService';
import gameModel from './gameModel';

export function useGame(sessionId) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      // Don't set loading to true for every refresh to avoid flickering
      const data = await gameService.getSession(sessionId);
      setSession(gameModel.formatSession(data.data));
    } catch (err) {
      setError(err.message || 'Failed to fetch game session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
    
    // Polling for AI move if it's not our turn
    let interval;
    if (session && session.status === 'ACTIVE' && session.currentTurn === 'PLAYER2') {
      interval = setInterval(fetchSession, 2000);
    }
    
    return () => clearInterval(interval);
  }, [fetchSession, session?.status, session?.currentTurn]);

  const makeMove = async (row, col) => {
    if (!session || session.status !== 'ACTIVE') return;
    
    try {
      const data = await gameService.makeMove(sessionId, { row, col, marker: session.p1.marker });
      setSession(gameModel.formatSession(data.data));
    } catch (err) {
      setError(err.message || 'Failed to make move');
    }
  };

  return { session, loading, error, makeMove, refresh: fetchSession };
}
