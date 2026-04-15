const mongoose = require('mongoose');
const env = require('./env.js');

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

<<<<<<< HEAD:backend/src/configs/db.js
module.exports = connectDB;
=======
export default connectDB;
>>>>>>> feature/ui-stabilization:packages/backend/src/configs/db.js
