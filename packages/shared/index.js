import * as GameLogic from './utils/gameLogicUtil.js';
import * as AILogic from './utils/aiLogicUtil.js';

export { GameLogic, AILogic };

// Re-export specific common functions for convenience
export const { checkWin, isValidMove, isBoardFull } = GameLogic;
export const { getBestMove } = AILogic;

