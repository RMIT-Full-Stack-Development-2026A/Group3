import httpUtil from '../../shared/utils/httpUtil';

const replayService = {
  getReplay: async (sessionId) => {
    return await httpUtil.get(`/game/${sessionId}/replay`);
  }
};

export default replayService;
