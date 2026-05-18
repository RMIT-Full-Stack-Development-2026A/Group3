import { Transaction, Subscription } from './subscriptionModel.js';

class SubscriptionRepository {
    /**
     * Create a financial transaction record.
     */
    async createTransaction({ userId, type, amount, status = 'SUCCESS' }) {
        return await Transaction.create({ userId, type, amount, status });
    }

    /**
     * Create a premium subscription record.
     */
    async createSubscription({ userId, transactionId, validFrom, validUntil }) {
        return await Subscription.create({
            userId,
            transactionId,
            validFrom,
            validUntil,
            status: 'ACTIVE',
        });
    }

    /**
     * Find the currently active (non-expired) subscription for a user.
     */
    async findActiveSubscription(userId) {
        return await Subscription.findOne({
            userId,
            status: 'ACTIVE',
            validUntil: { $gt: new Date() },
        })
        .sort({ validUntil: -1 })
        .lean();
    }

    /**
     * Get recent transaction history for a user.
     */
    async getTransactionHistory(userId, limit = 20) {
        return await Transaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }
}

export default new SubscriptionRepository();
