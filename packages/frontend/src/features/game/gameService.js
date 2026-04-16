import httpUtil from '../../utils/httpUtil';
import GameModel from './gameModel';

/**
 * GameService - Minimal Data Access Layer.
 */
const GameService = {
    getMatchHistory: async () => {
        try {
            return await httpUtil.get('/profile/me/history');
        } catch (error) {
            console.error('Failed to fetch match history:', error);
            return [];
        }
    },

    startGame: async (config, currentUserId) => {
        const response = await httpUtil.post('/game/create', config);
        if (response.success) {
            response.data = GameModel.createGameSessionModel(response.data, currentUserId);
        }
        return response;
    },

    getGame: async (sessionId, currentUserId) => {
        const response = await httpUtil.get(`/game/${sessionId}`);
        if (response.success) {
            response.data = GameModel.createGameSessionModel(response.data, currentUserId);
        }
        return response;
    },

    makeMove: async (sessionId, { x, y, userId }) => {
        const response = await httpUtil.post(`/game/${sessionId}/move`, { x, y });
        if (response.success) {
            response.data = GameModel.createGameSessionModel(response.data, userId);
        }
        return response;
    }
};

export default GameService;
