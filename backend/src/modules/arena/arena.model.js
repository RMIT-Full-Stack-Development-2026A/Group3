/** arena model */

import mongoose from 'mongoose';

const gameRoomSchema = new mongoose.Schema({
    roomCode: { type: String, required: true, unique: true, index: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameSession', default: null },
    status: { type: String, enum: ['WAITING', 'PLAYING', 'CLOSED'], default: 'WAITING' }
}, { timestamps: true });

const matchmakingTicketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    eloScore: { type: Number, required: true, index: true },
    status: { type: String, enum: ['QUEUING', 'MATCHED'], default: 'QUEUING' },
    matchedRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameRoom', default: null },
    createdAt: { type: Date, default: Date.now }
});

const chatMessageSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameRoom', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: true }
});

export const GameRoom = mongoose.model('GameRoom', gameRoomSchema);
export const MatchmakingTicket = mongoose.model('MatchmakingTicket', matchmakingTicketSchema);
export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);