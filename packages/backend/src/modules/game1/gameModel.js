import mongoose from 'mongoose';

const moveSchema = new mongoose.Schema({
    step: { type: Number, required: true },
    pId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    marker: { type: String, required: true },
    time: { type: Date, default: Date.now }
}, { _id: false });

const gameSessionSchema = new mongoose.Schema({
    gameType: { type: String, enum: ['SINGLE', 'LOCAL', 'ONLINE'], required: true },
    boardSize: { type: Number, enum: [10, 15], required: true },
    
    player1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', index: true, required: true },
    player1Marker: { type: String, enum: ['CROSS', 'CIRCLE', 'TRIANGLE', 'SQUARE', 'DIAMOND', 'STAR'], required: true},
    player1Name: { type: String, required: true },
    player1Avatar: { type: String, default: '' },
    
    player2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', index: true, default: null },
    player2Marker: { type: String, enum: ['CROSS', 'CIRCLE', 'TRIANGLE', 'SQUARE', 'DIAMOND', 'STAR'], required: true },
    player2Name: { type: String, required: true },
    player2Avatar: { type: String, default: '' },
    
    currentTurn: { type: String, enum: ['PLAYER1', 'PLAYER2'], required: true },
    boardState: { type: [[String]], default: [] },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: null }, 
    status: { type: String, enum: ['ACTIVE', 'WIN', 'LOSS', 'DRAW', 'ABORTED'], default: 'ACTIVE' },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    winLine: {
        type: [{
            x: { type: Number, required: true },
            y: { type: Number, required: true },
            _id: false
        }],
    default: [] },

    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'game_room', default: null },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: null },
    moves: [moveSchema]

}, { timestamps: true,
    versionKey: false
 });

gameSessionSchema.index({ player1Id: 1, updatedAt: -1 });
gameSessionSchema.index({ player2Id: 1, updatedAt: -1 });
gameSessionSchema.index({ status: 1, updatedAt: -1 });

const GameSession = mongoose.models.game_session || mongoose.model('game_session', gameSessionSchema);

export {
    GameSession
};