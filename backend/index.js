import 'dotenv/config.js';
import express from 'express';
import { connectDB } from './src/configs/db.js';
import gameRoute from './src/modules/game/game.route.js';

const app = express();

// Database Connection
connectDB();

app.use(express.json());

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running' });
});

app.use('/api/v1/game', gameRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});