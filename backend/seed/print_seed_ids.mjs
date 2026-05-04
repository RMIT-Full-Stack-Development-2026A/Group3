import mongoose from 'mongoose';
import 'dotenv/config';
import { GameSession } from '../src/modules/game/game.model.js';

const run = async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('Missing MONGO_URI or MONGODB_URI in environment.');
        process.exit(1);
    }

    await mongoose.connect(mongoUri);
    const sessions = await GameSession.find({ player1Name: 'Seed Premium' }).lean();

    if (!sessions.length) {
        console.log('No sessions found with player1Name = Seed Premium');
    } else {
        sessions.forEach((session) => {
            console.log('GAME ID:', String(session._id));
            console.log('  players:', session.player1Name, 'vs', session.player2Name);
            console.log('  boardSize:', session.boardSize, 'status:', session.status);
        });
    }

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
