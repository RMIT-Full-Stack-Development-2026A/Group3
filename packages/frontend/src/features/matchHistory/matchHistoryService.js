import httpUtil from '../../shared/utils/httpUtil';

const matchHistoryService = {
  getHistory: async (params = {}) => {
    const query = new URLSearchParams();
    
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.result && params.result !== 'ALL') query.set('result', params.result);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);

    const queryString = query.toString();
    return await httpUtil.get(`/game/history${queryString ? `?${queryString}` : ''}`);
  }
};

export default matchHistoryService;
