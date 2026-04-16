import httpUtil from '../../utils/httpUtil';

/**
 * GameService - Data Access Layer (Layer 4).
 * Modularized Feature Service for Game.
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

    startGame: async (config) => {
        return await httpUtil.post('/game/start', config);
    },

    makeMove: async (payload) => {
        return await httpUtil.post('/game/move', payload);
    },

    syncMatchResults: async (results) => {
        return await httpUtil.post('/game/sync-local', results);
    }
};

export default GameService;

