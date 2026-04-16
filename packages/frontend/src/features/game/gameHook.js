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

    /**
     * Synchronize the completed match to the Backend
     */
    const syncMatchToBackend = async (finalWinner, finalWinLine, finalMoves) => {
        const shouldSync = (gameType === 'LOCAL' || (gameType === 'SINGLE' && difficulty === 'HARD')) && p1Id;
        
        if (shouldSync) {
            try {
                const matchData = {
                    gameType,
                    boardSize,
                    p1Id,
                    p1Name,
                    p2Name: gameType === 'LOCAL' ? 'Guest' : `AI (${difficulty})`,
                    winnerId: finalWinner === 'X' ? p1Id : null,
                    winLine: finalWinLine,
                    moves: finalMoves
                };
                await GameService.syncMatchResults(matchData);
                console.log('Match history successfully archived to backend.');
            } catch (error) {
                console.error('Failed to archive match history:', error);
            }
        }
    };

    /**
     * Handle AI Move calculation via Backend
     */
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
