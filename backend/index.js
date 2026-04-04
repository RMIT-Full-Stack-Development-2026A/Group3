require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/configs/db');
const authRouter = require('./src/modules/auth/auth.route');

const app = express();

// Database Connection
connectDB();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running' });
});

// Auth routes
app.use('/api/v1/auth', authRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});