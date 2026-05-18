import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import replayService from './replayService';
import replayModel from './replayModel';

const buildEmptyBoard = (size) => Array.from({ length: size }, () => Array.from({ length: size }, () => null));

const buildBoardAtStep = (size, moves, step) => {
  const board = buildEmptyBoard(size);
  const maxStep = Math.min(step, moves.length);

  for (let i = 0; i < maxStep; i += 1) {
    const move = moves[i];
    if (move && board[move.y] && board[move.y][move.x] !== undefined) {
      board[move.y][move.x] = move.marker;
    }
  }

  return board;
};

export function useReplay(sessionId, options = {}) {
  const { playbackMs = 800 } = options;
  const [replay, setReplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);

  const totalMoves = replay?.moves?.length || 0;

  const fetchReplay = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await replayService.getReplay(sessionId);
      const data = response.data || response;
      setReplay(replayModel.formatReplay(data));
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (err) {
      setError(err.message || 'Failed to load replay');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchReplay();
  }, [fetchReplay]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    timerRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalMoves) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playbackMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackMs, totalMoves]);

  const board = useMemo(() => {
    const size = replay?.boardSize || 10;
    const moves = replay?.moves || [];
    return buildBoardAtStep(size, moves, currentStep);
  }, [replay, currentStep]);

  const setStep = useCallback((step) => {
    const clamped = Math.max(0, Math.min(step, totalMoves));
    setCurrentStep(clamped);
  }, [totalMoves]);

  const play = useCallback(() => {
    if (totalMoves === 0) return;
    setIsPlaying(true);
  }, [totalMoves]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const next = useCallback(() => setStep(currentStep + 1), [currentStep, setStep]);

  const prev = useCallback(() => setStep(currentStep - 1), [currentStep, setStep]);

  const reset = useCallback(() => setStep(0), [setStep]);

  const jumpToEnd = useCallback(() => setStep(totalMoves), [setStep, totalMoves]);

  return {
    replay,
    board,
    boardTheme: replay?.boardTheme || 'DEFAULT',
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
    setStep,
    refresh: fetchReplay
  };
}
