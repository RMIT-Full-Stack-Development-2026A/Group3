import { useState } from 'react';
import { checkWin, isValidMove } from './helper/gameLogic.helper';

export const useGameLogic = (initialSize = 10) => {
    // State variables to store the game state
    const [boardSize, setBoardSize] = useState(initialSize);
    
    // Create a 2D array filled with null
    const createEmptyBoard = (size) => Array(size).fill(null).map(() => Array(size).fill(null));
    const [board, setBoard] = useState(createEmptyBoard(initialSize));
    
    const [currentTurn, setCurrentTurn] = useState('X');
    const [winner, setWinner] = useState(null);
    const [winLine, setWinLine] = useState(null); // win line to highlight

    // Reset Game function
    const resetGame = (newSize = boardSize) => {
        setBoardSize(newSize);
        setBoard(createEmptyBoard(newSize));
        setCurrentTurn('X');
        setWinner(null);
        setWinLine(null);
    };

    // Function triggered when a player clicks on the board
    const makeMove = (row, col) => {
        // Block interaction if there's already a winner or the move is invalid
        if (winner || !isValidMove(board, row, col)) return;

        // Clone the 2D array to ensure React's immutability
        const newBoard = board.map(r => [...r]);
        
        // Update the clicked position
        newBoard[row][col] = currentTurn;
        setBoard(newBoard);

        // Call checkWin function to receive 1 object
        const result = checkWin(newBoard, row, col, currentTurn);
        
        if (result.win) {
            // Update winner and pass winLine to UI to highlight
            setWinner(currentTurn);
            setWinLine(result.winLine); 
        } else {
            // if nobody win, change turn
            setCurrentTurn(currentTurn === 'X'? 'O' : 'X');
        }
    };

    return { board, currentTurn, winner, winLine, resetGame, makeMove };
};