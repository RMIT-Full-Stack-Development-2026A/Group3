import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './src/configs/db.js';
import gameRouter from './src/modules/game/gameRoute.js';
import authRouter from './src/modules/auth/authRoute.js';
<<<<<<< HEAD:packages/backend/index.js
=======
import usersRouter from './src/modules/users/usersRoute.js';
>>>>>>> origin/merge/login-register:backend/index.js
import profileRouter from './src/modules/profile/profileRoute.js';

const app = express();

// Database Connection
connectDB();

app.use(cors());
app.use(express.json());

// Serve static files (avatars)
app.use('/uploads', express.static('uploads'));

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running' });
});

// Auth routes
app.use('/api/v1/auth', authRouter);

// Game Module
app.use('/api/v1/game', gameRouter);

// Users module
app.use('/api/v1/users', usersRouter);

// Profile module
app.use('/api/v1/profile', profileRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
