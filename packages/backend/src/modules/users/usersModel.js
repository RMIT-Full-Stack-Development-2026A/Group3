import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, index: true, trim: true },
        email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['PLAYER', 'ADMIN'], default: 'PLAYER' },
        isActive: { type: Boolean, default: true },
        loginAttempts: { type: Number, required: true, default: 0 },
        lockUntil: { type: Date }
    },
    { timestamps: true }
);

export const User = mongoose.model('user', userSchema);
