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
  },

  mapReplayMoves: (moves = []) => {
    return moves.map((move) => ({
      step: move.step,
      playerId: move.pId,
      x: move.x,
      y: move.y,
      marker: move.marker,
      time: move.time
    }));
  },

  toReplayResponse: (game) => {
    return {
      id: game._id,
      gameType: game.gameType,
      boardSize: game.boardSize,
      status: game.status,
      winnerId: game.winnerId,
      winLine: game.winLine || [],
      players: {
        player1Id: game.player1Id,
        player1Name: game.player1Name,
        player2Id: game.player2Id,
        player2Name: game.player2Name
      },
      moves: gameDTO.mapReplayMoves(game.moves)
    };
  }
};

module.exports = gameDTO;
