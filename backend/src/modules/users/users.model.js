const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
        email: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
        passwordHash: { type: String, required: true },
        country: { type: String, required: true },
        avatarUrl: { type: String, default: '' },
        role: { type: String, enum: ['PLAYER', 'ADMIN'], default: 'PLAYER' },
        isActive: { type: Boolean, default: true },
        walletBalance: { type: Number, default: 0 },
        isPremium: { type: Boolean, default: false },
        premiumExpiry: { type: Date, default: null }
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = { User };