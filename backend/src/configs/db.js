import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
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

