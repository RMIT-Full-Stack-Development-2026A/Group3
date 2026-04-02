/** users model */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    country: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: ['PLAYER', 'ADMIN'], default: 'PLAYER' },
    isActive: { type: Boolean, default: true },
    walletBalance: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    lockedUntil: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);