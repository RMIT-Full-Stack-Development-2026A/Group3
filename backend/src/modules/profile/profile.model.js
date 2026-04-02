/** profile model */

import mongoose from 'mongoose';

const userStatisticSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalGames: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    eloRating: { type: Number, default: 1000 }
});
// Index DESC để lấy Leaderboard siêu tốc
userStatisticSchema.index({ eloRating: -1 });

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['SYSTEM', 'PREMIUM_EXPIRE'], required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export const UserStatistic = mongoose.model('UserStatistic', userStatisticSchema);
export const Notification = mongoose.model('Notification', notificationSchema);

