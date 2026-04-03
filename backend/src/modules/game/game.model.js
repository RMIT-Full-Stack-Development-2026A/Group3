/** game model */

import mongoose from 'mongoose';

const moveSchema = new mongoose.Schema({
    step: { type: Number, required: true },
    pId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    marker: { type: String, enum: ['X', 'O'], required: true },
    time: { type: Date, default: Date.now }
}, { _id: false });

const gameSessionSchema = new mongoose.Schema({
    gameType: { type: String, enum: ['SINGLE', 'LOCAL', 'ONLINE'], required: true },
    boardSize: { type: Number, enum: [10, 15], required: true },
    
    // save both ID and Name/Avatar to query history
    player1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    player1Name: { type: String, required: true },
    player1Avatar: { type: String },
    
    player2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null },
    player2Name: { type: String, required: true },
    
    currentTurn: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    boardState: [[{ type: mongoose.Schema.Types.Mixed, default: null }]], 
    
    status: { type: String, enum: ['ACTIVE', 'WIN', 'DRAW', 'ABORTED', 'ADMIN_CLOSED'], default: 'ACTIVE' },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    winLine: [{ x: Number, y: Number }],
    
    moves: [moveSchema] // Directly immerse the move.
}, { timestamps: true });

export const GameSession = mongoose.model('GameSession', gameSessionSchema);