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
