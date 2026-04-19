import httpUtil from '../../shared/utils/httpUtil';

const gameService = {
  createSession: async (config) => {
    return await httpUtil.post('/game/sessions', config);
  },
  getSession: async (sessionId) => {
    return await httpUtil.get(`/game/sessions/${sessionId}`);
  },
  makeMove: async (sessionId, move) => {
    return await httpUtil.post(`/game/sessions/${sessionId}/move`, move);
  },
  getMatchHistory: async () => {
    return await httpUtil.get('/game/history');
  }
};

export default gameService;
