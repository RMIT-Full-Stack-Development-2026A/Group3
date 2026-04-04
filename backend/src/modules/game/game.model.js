const mongoose = require('mongoose');

const moveSchema = new mongoose.Schema({
    step: { type: Number, required: true },
    pId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    marker: { type: String, enum: ['X', 'O'], required: true },
    time: { type: Date, default: Date.now }
}, { _id: false });

const gameSessionSchema = new mongoose.Schema({
    gameType: { type: String, enum: ['SINGLE', 'LOCAL', 'ONLINE'], required: true },
    boardSize: { type: Number, enum: [10, 15], required: true },
    
    player1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', index: true, required: true },
    player1Name: { type: String, required: true },
    player1Avatar: { type: String, default: '' },
    
    player2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', index: true, default: null },
    player2Name: { type: String, required: true },
    
    currentTurn: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    boardState: [[{ type: mongoose.Schema.Types.Mixed, default: null }]], 
    
    status: { type: String, enum: ['ACTIVE', 'WIN', 'DRAW', 'LOSE', 'ABORTED', 'ADMIN_CLOSED'], default: 'ACTIVE' },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    winLine: [{ x: Number, y: Number }],
    
    moves: [moveSchema] // Embed sub-document
}, { timestamps: true });

const GameSession = mongoose.models.game_session || mongoose.model('game_session', gameSessionSchema);

module.exports = {
    GameSession
};