import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
    type: { type: String, enum: ['DEPOSIT', 'BUY_PREMIUM'], required: true },
    amount: { type: Number, required: true },
}, { timestamps: true });

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true, index: true }, // Index để quét cronjob những ai hết hạn
    status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'], default: 'ACTIVE' },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'transaction', required: true }
}, { timestamps: true });

export const Transaction = mongoose.model('transaction', transactionSchema);
export const Subscription = mongoose.model('subscription', subscriptionSchema);