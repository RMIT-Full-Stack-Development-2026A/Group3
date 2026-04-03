import mongoose from 'mongoose';

const gameRoomSchema = new mongoose.Schema({
    roomCode: { type: String, required: true, unique: true, index: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameSession', default: null },
    status: { type: String, enum: ['WAITING', 'PLAYING', 'CLOSED'], default: 'WAITING' }
}, { timestamps: true });

const chatMessageSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'game_room', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    message: { type: String, required: true }
}, { timestamps: true });

export const GameRoom = mongoose.model('game_room', gameRoomSchema);
export const ChatMessage = mongoose.model('chat_message', chatMessageSchema);