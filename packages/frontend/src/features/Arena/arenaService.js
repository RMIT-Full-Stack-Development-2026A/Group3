import httpUtil from '../../shared/utils/httpUtil';

const arenaService = {
  async listRooms() {
    return await httpUtil.get('/arena/rooms');
  },

  async createRoom(config = {}) {
    return await httpUtil.post('/arena/rooms', config);
  },

  async joinRoom(code) {
    return await httpUtil.post(`/arena/rooms/${code}/join`);
  }
};

export default arenaService;
