import gameService from './gameService.js';

class GameController {
  async startGame(req, res) {
    try {
      const userId = req.user.id;
      const gameData = req.body;

      const game = await gameService.startGame(userId, gameData);
      
      return res.status(201).json({
        success: true,
        message: 'Match is ready!',
        data: game
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to start match.'
      });
    }
  }

  async makeMove(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const { x, y } = req.body;

      const updatedGame = await gameService.makeMove(sessionId, userId, { x, y });

      return res.status(200).json({
        success: true,
        data: updatedGame
      });
    } catch (error) {
      // Phân loại mã lỗi trả về cho Frontend
      const statusCode = error.message.includes('not found') ? 404 : 400;
      
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Invalid move'
      });
    }
  }

  async getGame(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const game = await gameService.getGameById(sessionId, userId);

      return res.status(200).json({
        success: true,
        data: game
      });
    } catch (error) {
      const statusCode = error.message.includes('permission') ? 403 : 404;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Game not found.'
      });
    }
  }

  async getMyHistory(req, res) {
    try {
      const userId = req.user.id;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);

      const history = await gameService.getPlayerHistory(userId, limit);

      return res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load match history.'
      });
    }
  }
}

export default new GameController();
