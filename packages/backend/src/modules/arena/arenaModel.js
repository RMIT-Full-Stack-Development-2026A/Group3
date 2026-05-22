import mongoose from 'mongoose';


const gameRoomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true, index: true },
  player1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  player1Name: { type: String, required: true },
  player2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
  player2Name: { type: String, default: null },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'game_session', default: null },
  status: { type: String, enum: ['WAITING', 'PLAYING', 'ABORT', 'CLOSED'], default: 'WAITING' },
  endTime: { type: Date, default: null }
}, { timestamps: true });

export const GameRoom = mongoose.model('game_room', gameRoomSchema);
