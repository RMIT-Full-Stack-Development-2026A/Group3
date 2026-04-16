import GameService from '../game/gameService.js';
import { toMatchHistoryRow } from './matchHistoryModel.js';

const MatchHistoryService = {
  async getHistory(params = {}) {
    const payload = await GameService.getMatchHistory(params);

    return {
      items: (payload.items || []).map(toMatchHistoryRow),
      pagination: payload.pagination || null
    };
  }
};

export default MatchHistoryService;
