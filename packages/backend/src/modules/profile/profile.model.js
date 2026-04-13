import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true, index: true },
  country: { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  walletBalance: { type: Number, default: 0 },
  premiumExpiry: { type: Date, default: null }
}, { timestamps: true });

const userStatisticSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true },
  totalGames: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  eloRating: { type: Number, default: 1000 }
}, { timestamps: { createdAt: false, updatedAt: true }});

userStatisticSchema.index({ eloRating: -1 });

export const Profile = mongoose.model('profile', profileSchema);
export const UserStatistic = mongoose.model('user_statistic', userStatisticSchema);