import mongoose from 'mongoose';
import 'dotenv/config';
import { User } from '../src/modules/users/users.model.js';
import { GameSession } from '../src/modules/game/game.model.js';

const buildEmptyBoard = (size) => {
    return Array.from({ length: size }, () => Array.from({ length: size }, () => null));
};

const applyMovesToBoard = (board, moves) => {
    moves.forEach((move) => {
        if (board[move.y] && board[move.y][move.x] !== undefined) {
            board[move.y][move.x] = move.marker;
        }
    });

    return board;
};

const buildMoves = (rawMoves, baseTime) => {
    return rawMoves.map((move, index) => ({
        step: index + 1,
        pId: move.pId,
        x: move.x,
        y: move.y,
        marker: move.marker,
        time: new Date(baseTime.getTime() + index * 1000)
    }));
};

const createSeedUsers = async () => {
    const premiumUser = await User.findOneAndUpdate(
        { username: 'seed_premium' },
        {
            $set: {
                username: 'seed_premium',
                email: 'seed_premium@example.com',
                passwordHash: 'hashed_password_seed_premium',
                country: 'VN',
                avatarUrl: '',
                role: 'player',
                isActive: true,
                isPremium: true,
                premiumExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const standardUser = await User.findOneAndUpdate(
        { username: 'seed_standard' },
        {
            $set: {
                username: 'seed_standard',
                email: 'seed_standard@example.com',
                passwordHash: 'hashed_password_seed_standard',
                country: 'US',
                avatarUrl: '',
                role: 'player',
                isActive: true,
                isPremium: false,
                premiumExpiry: null
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return { premiumUser, standardUser };
};

const seedReplaySessions = async () => {
    const { premiumUser, standardUser } = await createSeedUsers();

    await GameSession.deleteMany({ player1Name: 'Seed Premium' });

    const baseTime = new Date();

    const game1RawMoves = [
        { pId: premiumUser._id, x: 0, y: 0, marker: 'X' },
        { pId: standardUser._id, x: 1, y: 0, marker: 'O' },
        { pId: premiumUser._id, x: 0, y: 1, marker: 'X' },
        { pId: standardUser._id, x: 1, y: 1, marker: 'O' },
        { pId: premiumUser._id, x: 0, y: 2, marker: 'X' },
        { pId: standardUser._id, x: 1, y: 2, marker: 'O' },
        { pId: premiumUser._id, x: 0, y: 3, marker: 'X' },
        { pId: standardUser._id, x: 1, y: 3, marker: 'O' },
        { pId: premiumUser._id, x: 0, y: 4, marker: 'X' }
    ];

    const game1Moves = buildMoves(game1RawMoves, baseTime);
    const game1Board = applyMovesToBoard(buildEmptyBoard(10), game1Moves);

    const game2RawMoves = [
        { pId: premiumUser._id, x: 7, y: 7, marker: 'X' },
        { pId: standardUser._id, x: 8, y: 7, marker: 'O' },
        { pId: premiumUser._id, x: 7, y: 8, marker: 'X' },
        { pId: standardUser._id, x: 8, y: 8, marker: 'O' },
        { pId: premiumUser._id, x: 6, y: 7, marker: 'X' },
        { pId: standardUser._id, x: 9, y: 7, marker: 'O' },
        { pId: premiumUser._id, x: 6, y: 8, marker: 'X' },
        { pId: standardUser._id, x: 9, y: 8, marker: 'O' },
        { pId: premiumUser._id, x: 7, y: 6, marker: 'X' },
        { pId: standardUser._id, x: 7, y: 9, marker: 'O' },
        { pId: premiumUser._id, x: 8, y: 6, marker: 'X' },
        { pId: standardUser._id, x: 8, y: 9, marker: 'O' }
    ];

    const game2Moves = buildMoves(game2RawMoves, new Date(baseTime.getTime() + 60 * 1000));
    const game2Board = applyMovesToBoard(buildEmptyBoard(15), game2Moves);

    await GameSession.create([
        {
            gameType: 'ONLINE',
            boardSize: 10,
            player1Id: premiumUser._id,
            player1Name: 'Seed Premium',
            player1Avatar: '',
            player2Id: standardUser._id,
            player2Name: 'Seed Standard',
            currentTurn: null,
            boardState: game1Board,
            status: 'WIN',
            winnerId: premiumUser._id,
            winLine: [
                { x: 0, y: 0 },
                { x: 0, y: 1 },
                { x: 0, y: 2 },
                { x: 0, y: 3 },
                { x: 0, y: 4 }
            ],
            moves: game1Moves
        },
        {
            gameType: 'LOCAL',
            boardSize: 15,
            player1Id: premiumUser._id,
            player1Name: 'Seed Premium',
            player1Avatar: '',
            player2Id: standardUser._id,
            player2Name: 'Seed Standard',
            currentTurn: null,
            boardState: game2Board,
            status: 'DRAW',
            winnerId: null,
            winLine: [],
            moves: game2Moves
        }
    ]);

    console.log('Seeded replay sessions.');
};

const run = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('Missing MONGO_URI in environment.');
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);
        await seedReplaySessions();
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Replay seed failed:', error);
        process.exit(1);
    }
};

run();
