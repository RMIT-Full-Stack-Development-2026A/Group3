import httpUtil from '../../utils/http.util';

/**
 * GameService - Data Access Layer (Layer 4).
 * Modularized Feature Service for Game.
 */
const GameService = {
    getMatchHistory: async () => {
        try {
            return await httpUtil.get('/game/history');
        } catch (error) {
            console.error('Failed to fetch match history:', error);
            return [];
        }
    },

    startGame: async (config) => {
        return await httpUtil.post('/game/start', config);
    },

    syncMatchResults: async (results) => {
        return await httpUtil.post('/game/sync-local', results);
    }
};

export default GameService;
