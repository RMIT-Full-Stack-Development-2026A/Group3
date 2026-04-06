import GameService from './game.service.js';
import GameDTO from './game.dto.js';

/**
 * Game Controller - Handles HTTP request/response for the Game module.
 */
const GameController = {
  /**
   * Start a new game session (AI or Private Room placeholder)
   */
  async startGame(req, res) {
    try {
      const gameData = req.body;
      const result = await GameService.initGame(gameData);
      
      res.status(201).json({
        success: true,
        data: result // sessionId, board, isReplayable
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Handle a player's move in AI Mode
   */
  async makeMove(req, res) {
    try {
      const { board, difficulty, aiMarker, playerMarker } = req.body;
      
      // 1. Validate move and calculate AI counter
      const result = await GameService.processAIMove(board, difficulty, aiMarker, playerMarker);
      
      // 2. Respond to client
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  /**
   * Sync a completed local (offline) match to the database for replay
   */
  async syncLocalMatch(req, res) {
    try {
      // 1. Filter input data using DTO
      const matchData = GameDTO.toSyncLocalRequest(req.body);
      
      // 2. Persist via Service (which will call the Repo)
      const session = await GameService.saveMatchResult(matchData);
      
      // 3. Return shaped response
      res.status(201).json({
        success: true,
        data: GameDTO.toGameResponse(session)
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};

export default GameController;
