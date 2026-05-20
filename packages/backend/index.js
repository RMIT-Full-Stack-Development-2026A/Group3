import 'dotenv/config'
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

// Arena module
app.use('/api/v1/arena', arenaRouter);

// Profile module
app.use('/api/v1/profile', profileRouter);

// Subscription module
app.use('/api/v1/subscription', subscriptionRouter);

// Admin module
app.use('/api/v1/admin', adminRouter);

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

// In-memory chat buffer: stores messages per room
// Structure: { 'roomCode': [ { senderId, senderName, message, timestamp }, ... ] }
const chatBuffer = {};

// Track connected users per room for cleanup
const roomConnections = {};

io.on('connection', (socket) => {
    // Basic connection logging
    const uid = socket.user?.id || 'anonymous';
    console.log(`Socket connected: ${socket.id} user:${uid}`);

    socket.on('join-room', async (roomCode) => {
        if (!roomCode) return;
        const roomName = `room-${roomCode}`;
        socket.join(roomName);

        // Track connection for this room
        if (!roomConnections[roomCode]) {
            roomConnections[roomCode] = [];
        }
        roomConnections[roomCode].push(socket.id);
    });

    socket.on('leave-room', (roomCode) => {
        if (!roomCode) return;
        const roomName = `room-${roomCode}`;
        socket.leave(roomName);

        // Remove socket from room connections
        if (roomConnections[roomCode]) {
            roomConnections[roomCode] = roomConnections[roomCode].filter(id => id !== socket.id);

            // If no more connections, cleanup chat buffer for this room
            if (roomConnections[roomCode].length === 0) {
                delete chatBuffer[roomCode];
                delete roomConnections[roomCode];
                console.log(`Chat buffer cleared for room: ${roomCode}`);
            }
        }
    });

    socket.on('chat:message', (data) => {
        const { roomCode, message } = data;
        if (!roomCode || !socket.user) return;

        // Message validation
        const trimmedMessage = message.trim();
        if (trimmedMessage.length === 0 || trimmedMessage.length > 200) {
            return;
        }

        // Create message object with metadata
        const messageObj = {
            senderId: socket.user.id,
            senderName: socket.user.username || 'Player',
            message: trimmedMessage,
            timestamp: new Date()
        };

        // Initialize chat buffer for this room if not exists
        if (!chatBuffer[roomCode]) {
            chatBuffer[roomCode] = [];
        }

        // Add message to buffer
        chatBuffer[roomCode].push(messageObj);

        // Broadcast message to all players in the room
        const roomName = `room-${roomCode}`;
        io.to(roomName).emit('chat:message', messageObj);

        console.log(`Chat message in room ${roomCode} from ${socket.user.username}: ${trimmedMessage}`);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id} user:${uid}`);
        
        // Clean up room connections on disconnect
        for (const roomCode in roomConnections) {
            roomConnections[roomCode] = roomConnections[roomCode].filter(id => id !== socket.id);
            if (roomConnections[roomCode].length === 0) {
                delete chatBuffer[roomCode];
                delete roomConnections[roomCode];
                console.log(`Chat buffer cleared for room: ${roomCode} (user disconnect)`);
            }
        }
    });
});

server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
});
