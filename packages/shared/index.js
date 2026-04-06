import * as GameLogic from './utils/gameLogic.util.js';
import * as AILogic from './utils/aiLogic.util.js';

export { GameLogic, AILogic };

// Re-export specific common functions for convenience
export const { checkWin, isValidMove, isBoardFull } = GameLogic;
export const { getBestMove, evaluatePosition } = AILogic;
