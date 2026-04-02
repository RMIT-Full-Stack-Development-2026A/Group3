/** auth model */

import mongoose from 'mongoose';

const userSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenSignature: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    isRevoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true }
});
// auto remove document when comes expiresAt
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const securityLogSchema = new mongoose.Schema({
    ipAddress: { type: String, required: true, index: true },
    event: { type: String, enum: ['LOGIN_FAILED', 'INVALID_TOKEN'], required: true },
    createdAt: { type: Date, default: Date.now }
});
// auto remove after 1 hour (3600s))
securityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

export const UserSession = mongoose.model('UserSession', userSessionSchema);
export const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);
