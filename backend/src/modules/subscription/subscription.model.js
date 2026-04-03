/** subscription model */

import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['DEPOSIT', 'BUY_PREMIUM'], required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['WALLET', 'STRIPE'], required: true },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now }
});

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'EXPIRED'], default: 'ACTIVE' },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true, index: true } // Index để Cronjob quét nhanh
});

export const Transaction = mongoose.model('Transaction', transactionSchema);
export const Subscription = mongoose.model('Subscription', subscriptionSchema);
