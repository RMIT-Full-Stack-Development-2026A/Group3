/**
 * Game DTO - Data Transfer Object
 * Handles request validation and response filtering
 */

const gameDTO = {
  // Transfer request to a clean object for the service
  toMoveRequest: (body) => {
    return {
      row: parseInt(body.row),
      col: parseInt(body.col),
      marker: body.marker
    };
  },

  // Filter game data for response to the frontend
  toGameResponse: (game) => {
    return {
      id: game._id,
      board: game.boardState,
      winner: game.winner,
      isOver: game.status !== 'ACTIVE'
    };
  }
};

module.exports = gameDTO;
