require('dotenv').config(); // Load biến môi trường từ .env
const express = require('express');
const connectDB = require('./config/db'); // Nhúng file kết nối DB

const app = express();

// Khởi chạy kết nối Database
connectDB();

app.use(express.json());

app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[TicTacToang] Server đang chạy tại cổng ${PORT}`);
});