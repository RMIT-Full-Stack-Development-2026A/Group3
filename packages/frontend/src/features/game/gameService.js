import httpUtil from '../../shared/utils/httpUtil';

const gameService = {

  getSession: async (sessionId) => {
    return await httpUtil.get(`/game/sessions/${sessionId}`);
  },

  makeMove: async (sessionId, moveData) => {
    return await httpUtil.post(`/game/sessions/${sessionId}/move`, moveData);
  },

  getMatchHistory: async () => {
    return await httpUtil.get('/game/history');
  },
  syncLocalMatch: async (gameData) => {
    return await httpUtil.post('/game/local', gameData);
  }
};

export default gameService;
