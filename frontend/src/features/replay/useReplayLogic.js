import { useEffect, useMemo, useState } from 'react';
import { applyMovesToBoard } from './replay.model';
import { fetchReplaySession } from './replay.service';

const DEFAULT_STEP_MS = 700;

export const useReplayLogic = () => {
  const [gameIdInput, setGameIdInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [session, setSession] = useState(null);
  const [moves, setMoves] = useState([]);
  const [boardSize, setBoardSize] = useState(10);
  const [currentMove, setCurrentMove] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const totalMoves = moves.length;

  const board = useMemo(() => {
    return applyMovesToBoard(boardSize, moves, currentMove);
  }, [boardSize, moves, currentMove]);

  useEffect(() => {
    if (isPaused || currentMove >= totalMoves) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setCurrentMove((prev) => Math.min(prev + 1, totalMoves));
    }, DEFAULT_STEP_MS);

    return () => clearTimeout(timer);
  }, [isPaused, currentMove, totalMoves]);

  const loadReplay = async () => {
    setError('');
    setIsLoading(true);

    try {
      const data = await fetchReplaySession(gameIdInput, tokenInput);
      const replayMoves = Array.isArray(data.moves) ? data.moves : [];

      setSession(data);
      setMoves(replayMoves);
      setBoardSize(Number(data.boardSize) || 10);
      setCurrentMove(0);
      setIsPaused(true);
    } catch (loadError) {
      setSession(null);
      setMoves([]);
      setCurrentMove(0);
      setError(loadError.message || 'Could not load replay.');
    } finally {
      setIsLoading(false);
    }
  };

  const pause = () => setIsPaused(true);
  const resume = () => {
    if (totalMoves > 0 && currentMove < totalMoves) {
      setIsPaused(false);
    }
  };
  const forward = () => {
    setIsPaused(true);
    setCurrentMove((prev) => Math.min(prev + 1, totalMoves));
  };
  const backward = () => {
    setIsPaused(true);
    setCurrentMove((prev) => Math.max(prev - 1, 0));
  };

  return {
    gameIdInput,
    setGameIdInput,
    tokenInput,
    setTokenInput,
    session,
    board,
    currentMove,
    totalMoves,
    isPaused,
    isLoading,
    error,
    loadReplay,
    pause,
    resume,
    forward,
    backward
  };
};
