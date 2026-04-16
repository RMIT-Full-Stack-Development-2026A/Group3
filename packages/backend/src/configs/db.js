import mongoose from 'mongoose';
import { env } from './env.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.MONGO_URI, {
            maxPoolSize: 100,
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database cannot connect: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
