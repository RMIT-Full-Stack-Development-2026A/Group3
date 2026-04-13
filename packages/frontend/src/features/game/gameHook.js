import { useState, useEffect, useCallback } from 'react';
import GameService from './gameService.js';

/**
 * useGameLogic - Simplified Core Hook.
 */
export const useGameLogic = (
    initialSize = 10, 
    p1Id = null, 
    sessionId = null
) => {
    const [gameState, setGameState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessingAI, setIsProcessingAI] = useState(false);

    const updateFromDTO = useCallback((dto) => {
        setGameState(dto);
        setIsLoading(false);
    }, []);

    // Load session
    useEffect(() => {
        const loadGame = async () => {
            if (!sessionId || !p1Id) return;
            setIsLoading(true);
            try {
                const response = await GameService.getGame(sessionId, p1Id);
                if (response.success) {
                    updateFromDTO(response.data);
                }
            } catch (error) {
                console.error('Game Load Error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadGame();
    }, [sessionId, p1Id, updateFromDTO]);

    // Move logic
    const makeMove = async (x, y) => {
        if (!gameState || !sessionId || gameState.status !== 'ACTIVE' || isProcessingAI) return;

        setIsProcessingAI(true);
        try {
            const response = await GameService.makeMove(sessionId, { x, y, userId: p1Id });
            if (response.success) {
                updateFromDTO(response.data);
            }
        } catch (error) {
            console.error('Move Error:', error);
        } finally {
            setIsProcessingAI(false);
        }
    };

    return { 
      board: gameState?.board || Array(initialSize).fill(null).map(() => Array(initialSize).fill(null)),
      currentTurn: gameState?.currentTurn || 'X',
      winner: gameState?.winnerMarker || null,
      winLine: gameState?.winLine || [],
      isLoading,
      isProcessingAI,
      makeMove,
      sessionInfo: gameState
    };
};
