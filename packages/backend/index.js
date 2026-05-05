import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import env from './src/configs/env.js'
import connectDB from './src/configs/db.js';
import gameRouter from './src/modules/game/gameRoute.js';
import authRouter from './src/modules/auth/authRoute.js';
import profileRouter from './src/modules/profile/profileRoute.js';
import subscriptionRouter from './src/modules/subscription/subscriptionRoute.js';
import adminRouter from './src/modules/admin/adminRoute.js';

const app = express();

// Database Connection
connectDB();

app.use(cors());
app.use(express.json());

// Serve static files (avatars)
app.use('/public', express.static('public'));

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running' });
});

// Auth routes
app.use('/api/v1/auth', authRouter);

// Game Module
app.use('/api/v1/game', gameRouter);

// Profile module
app.use('/api/v1/profile', profileRouter);

// Subscription module
app.use('/api/v1/subscription', subscriptionRouter);

// Admin module
app.use('/api/v1/admin', adminRouter);

const PORT = env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
