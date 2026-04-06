const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.MONGO_URI, {
            maxPoolSize: 100, // Đảm bảo chịu tải 100,000 users
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database cannot connect: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;