import { useState, useEffect } from 'react';
import { checkWin, isValidMove, isBoardFull } from '@tictactoang/shared';
import GameService from './gameService.js';

/**
 * useGameLogic - React Hook managing the Tic-Tac-Toe game state.
 * Supports: Offline Local (PVP), PvAI (from Backend), and Match Syncing.
 */
export const useGameLogic = (
    initialSize = 10, 
    gameType = 'LOCAL', 
    difficulty = 'EASY', 
    p1Id = null, 
    p1Name = 'Player 1'
) => {
    const [boardSize, setBoardSize] = useState(initialSize);
    const createEmptyBoard = (size) => Array(size).fill(null).map(() => Array(size).fill(null));
    
    const [board, setBoard] = useState(createEmptyBoard(initialSize));
    const [currentTurn, setCurrentTurn] = useState('X');
    const [winner, setWinner] = useState(null);
    const [winLine, setWinLine] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    
    const [moves, setMoves] = useState([]);

    /**
     * Reset Game state
     */
    const resetGame = (newSize = boardSize) => {
        setBoardSize(newSize);
        setBoard(createEmptyBoard(newSize));
        setCurrentTurn('X');
        setWinner(null);
        setWinLine(null);
        setIsDraw(false);
        setIsProcessingAI(false);
        setMoves([]);
    };

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
        const triggerAIMove = async () => {
            if (winner || isDraw || gameType !== 'SINGLE' || currentTurn !== 'O' || isProcessingAI) return;

            setIsProcessingAI(true);
            try {
                // Short delay for better UX (so AI doesn't feel instant)
                await new Promise(resolve => setTimeout(resolve, 600));

                const response = await GameService.makeMove({
                    board,
                    difficulty,
                    aiMarker: 'O',
                    playerMarker: 'X'
                });

                if (response.success) {
                    const { row, col, isWin, winLine: aiWinLine, isDraw: aiDraw } = response.data;
                    
                    const newBoard = board.map(r => [...r]);
                    newBoard[row][col] = 'O';

                    const aiMove = {
                        step: moves.length + 1,
                        pId: null,
                        x: row,
                        y: col,
                        marker: 'O',
                        time: new Date()
                    };

                    const updatedMoves = [...moves, aiMove];
                    setMoves(updatedMoves);
                    setBoard(newBoard);

                    if (isWin) {
                        setWinner('O');
                        setWinLine(aiWinLine);
                        syncMatchToBackend('O', aiWinLine, updatedMoves);
                    } else if (aiDraw) {
                        setIsDraw(true);
                        syncMatchToBackend(null, [], updatedMoves);
                    } else {
                        setCurrentTurn('X');
                    }
                }
            } catch (error) {
                console.error('AI Move Error:', error);
            } finally {
                setIsProcessingAI(false);
            }
        };

        triggerAIMove();
    }, [currentTurn, winner, isDraw]);

    /**
     * Handle a player's manual click
     */
    const makeMove = (row, col) => {
        if (winner || isDraw || isProcessingAI || !isValidMove(board, row, col)) return;

        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = currentTurn;
        
        const newMove = {
            step: moves.length + 1,
            pId: currentTurn === 'X' ? p1Id : null,
            x: row,
            y: col,
            marker: currentTurn,
            time: new Date()
        };
        
        const updatedMoves = [...moves, newMove];
        setMoves(updatedMoves);
        setBoard(newBoard);

        const result = checkWin(newBoard, row, col, currentTurn);

        if (result.win) {
            setWinner(currentTurn);
            setWinLine(result.winLine);
            syncMatchToBackend(currentTurn, result.winLine, updatedMoves);
        } else if (isBoardFull(newBoard)) {
            setIsDraw(true);
            syncMatchToBackend(null, [], updatedMoves);
        } else {
            setCurrentTurn(currentTurn === 'X' ? 'O' : 'X');
        }
    };

    return { board, currentTurn, winner, winLine, isDraw, isProcessingAI, resetGame, makeMove, moves };
};
