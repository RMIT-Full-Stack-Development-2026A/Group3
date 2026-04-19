import httpUtil from '../../shared/utils/httpUtil';

const matchHistoryService = {
  getHistory: async () => {
    return await httpUtil.get('/game/history');
  }
};

export default matchHistoryService;
