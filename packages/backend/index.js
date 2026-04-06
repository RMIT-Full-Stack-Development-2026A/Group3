import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/configs/db.js';
import gameRouter from './src/modules/game/game.route.js';
import authRouter from './src/modules/auth/auth.route.js';

const app = express();

// Database Connection
connectDB();

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running' });
});

// Auth routes
app.use('/api/v1/auth', authRouter);

// Game Module
app.use('/api/v1/game', gameRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});