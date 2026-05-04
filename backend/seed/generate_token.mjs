import mongoose from 'mongoose';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { User } from '../src/modules/users/users.model.js';

const [,, username, overridePremium] = process.argv;

if (!username) {
    console.error('Usage: node generate_token.mjs <username> [isPremiumOverride(true|false)]');
    process.exit(1);
}

const run = async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('Missing MONGO_URI or MONGODB_URI in environment.');
        process.exit(1);
    }

    await mongoose.connect(mongoUri);
    const user = await User.findOne({ username }).lean();

    if (!user) {
        console.error('User not found:', username);
        await mongoose.disconnect();
        process.exit(2);
    }

    const payload = {
        id: String(user._id),
        role: user.role || 'PLAYER',
        isPremium:
            overridePremium === 'true'
                ? true
                : overridePremium === 'false'
                    ? false
                    : Boolean(user.isPremium)
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    console.log('TOKEN for', username, ':');
    console.log(token);

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
