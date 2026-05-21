import { GameRoom } from './arenaModel.js';

const MAX_CODE_ATTEMPTS = 10;

function _randomCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const ArenaRepository = {
  async createRoom({ roomCode, player1Id, player1Name, boardSize = 10, player1Marker = 'CROSS', player2Marker = 'CIRCLE', moveFirst = 'PLAYER1' }) {
    const payload = {
      roomCode,
      player1Id,
      player1Name,
      boardSize,
      player1Marker,
      player2Marker,
      moveFirst,
      status: 'WAITING'
    };

    const room = await GameRoom.create(payload);
    return room;
  },

  async generateUniqueCode() {
    for (let i = 0; i < MAX_CODE_ATTEMPTS; i++) {
      const code = _randomCode();
      const exists = await GameRoom.findOne({ roomCode: code }).lean();
      if (!exists) return code;
    }
    throw new Error('Failed to generate unique room code');
  },

  async findByCode(roomCode) {
    return await GameRoom.findOne({ roomCode });
  },

  async listWaitingRooms(limit = 50) {
    return await GameRoom.find({ status: 'WAITING' }).sort({ createdAt: -1 }).limit(limit).lean();
  },

  async updateRoom(roomId, update) {
    return await GameRoom.findByIdAndUpdate(roomId, update, { new: true });
  },

  async abortPlayingRoomByCode(roomCode) {
    const now = new Date();
    return await GameRoom.findOneAndUpdate(
      { roomCode, status: 'PLAYING' },
      { $set: { status: 'ABORT', endTime: now } },
      { new: true }
    );
  }
};

export default ArenaRepository;
/** arena repository */
export const arenaRepository = {};
