import mongoose from 'mongoose';

const userStatisticSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalGames: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    eloRating: { type: Number, default: 1000 } // default 1000 elo rating point
});

userStatisticSchema.index({ eloRating: -1 });

export const UserStatistic = mongoose.model('user_statistic', userStatisticSchema);