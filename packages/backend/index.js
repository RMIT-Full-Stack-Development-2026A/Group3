import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from './src/configs/env.js'
import connectDB from './src/configs/db.js';
import gameRouter from './src/modules/game/gameRoute.js';
import authRouter from './src/modules/auth/authRoute.js';
import profileRouter from './src/modules/profile/profileRoute.js';
import arenaRouter from './src/modules/arena/arenaRoute.js';
import arenaService from './src/modules/arena/arenaService.js';
import { setIO as setSocketIO } from '@tictactoang/shared/utils/socketManager.js';

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

// Arena module
app.use('/api/v1/arena', arenaRouter);

// Profile module
app.use('/api/v1/profile', profileRouter);

const PORT = env.PORT;

// Create HTTP server and attach socket.io
const server = http.createServer(app);

const io = new IOServer(server, {
    cors: {
        origin: '*'
    }
});

// Simple socket auth middleware: expects token in handshake.auth.token
io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next();
    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        socket.user = payload;
        return next();
    } catch (err) {
        return next();
    }
});

// Provide io to arena service for emits
arenaService.setIO(io);
setSocketIO(io);

io.on('connection', (socket) => {
    // Basic connection logging
    const uid = socket.user?.id || 'anonymous';
    console.log(`Socket connected: ${socket.id} user:${uid}`);

    socket.on('join-room', async (roomCode) => {
        if (!roomCode) return;
        const roomName = `room-${roomCode}`;
        socket.join(roomName);
    });

    socket.on('leave-room', (roomCode) => {
        if (!roomCode) return;
        const roomName = `room-${roomCode}`;
        socket.leave(roomName);
    });
});

server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
});
