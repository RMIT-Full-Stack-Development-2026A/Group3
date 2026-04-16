import httpUtil from '../../utils/httpUtil';
import GameModel from './gameModel';

/**
 * GameService - Minimal Data Access Layer.
 */
const GameService = {
    getMatchHistory: async (params = {}) => {
        try {
            const response = await httpUtil.get('/game/history', { params });

            // Supports legacy array payloads and envelope payloads.
            if (Array.isArray(response)) {
                return {
                    items: response,
                    pagination: null
                };
            }

            if (Array.isArray(response?.data?.items)) {
                return {
                    items: response.data.items,
                    pagination: response.data.pagination || null
                };
            }

            if (Array.isArray(response?.data)) {
                return {
                    items: response.data,
                    pagination: null
                };
            }

            return {
                items: [],
                pagination: null
            };
        } catch (error) {
            console.error('Failed to fetch match history:', error);
            return {
                items: [],
                pagination: null
            };
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
