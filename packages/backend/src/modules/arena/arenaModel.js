import mongoose from 'mongoose';

// const gameRoomSchema = new mongoose.Schema({
//     roomCode: { type: String, required: true, unique: true, index: true },
//     hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
//     guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
//     sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'game_session', default: null },
//     status: { type: String, enum: ['WAITING', 'PLAYING', 'CLOSED'], default: 'WAITING' }
// }, { timestamps: true });
const gameRoomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true, index: true },
  player1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  player1Name: { type: String, required: true },
  player2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
  player2Name: { type: String, default: null },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'game_session', default: null },
  status: { type: String, enum: ['WAITING', 'PLAYING', 'CLOSED'], default: 'WAITING' },
  endTime: { type: Date, default: null }
}, { timestamps: true });

const chatMessageSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'game_room', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    senderName: { type: String, required: true },
    message: { type: String, required: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const GameRoom = mongoose.model('game_room', gameRoomSchema);
export const ChatMessage = mongoose.model('chat_message', chatMessageSchema);