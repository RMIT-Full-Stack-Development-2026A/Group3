<<<<<<< HEAD
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true
		},
		passwordHash: {
			type: String,
			required: true
		},
		role: {
			type: String,
			enum: ['PLAYER', 'ADMIN'],
			default: 'PLAYER'
		},
		isPremium: {
			type: Boolean,
			default: false
		}
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model('User', userSchema);
=======
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    country: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    role: { type: String, default: 'player' },
    isActive: { type: Boolean, default: true },
    walletBalance: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    premiumExpiry: { type: Date, default: null }
}, { timestamps: true });

export const User = mongoose.model('user', userSchema);
>>>>>>> origin/main
