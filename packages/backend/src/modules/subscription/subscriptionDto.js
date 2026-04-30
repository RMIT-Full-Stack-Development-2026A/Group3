const PLANS = {
    MONTHLY: { key: 'MONTHLY', label: 'Monthly', price: 4.99, days: 30 },
    YEARLY:  { key: 'YEARLY',  label: 'Yearly',  price: 49.99, days: 365 },
};

class SubscriptionDTO {
    /**
     * Validate and parse a wallet top-up request.
     */
    static toTopUpReq(body = {}) {
        const amount = parseFloat(body.amount);
        if (!Number.isFinite(amount) || amount < 1 || amount > 10000) {
            throw new Error('Top-up amount must be between $1 and $10,000');
        }
        return { amount: Math.round(amount * 100) / 100 }; // round to 2 decimals
    }

    /**
     * Validate and parse a subscription purchase request.
     * Returns the plan config object.
     */
    static toSubscribeReq(body = {}) {
        const planKey = String(body.plan || '').toUpperCase();
        const plan = PLANS[planKey];
        if (!plan) {
            throw new Error(`Invalid plan. Must be one of: ${Object.keys(PLANS).join(', ')}`);
        }
        return plan;
    }

    /**
     * Format the response after a successful top-up.
     */
    static toTopUpRes(transaction, newBalance) {
        return {
            transaction: {
                id: transaction._id.toString(),
                type: transaction.type,
                amount: transaction.amount,
                status: transaction.status,
                createdAt: transaction.createdAt,
            },
            walletBalance: newBalance,
        };
    }

    /**
     * Format the response after a successful subscription purchase.
     */
    static toSubscriptionRes(subscription, transaction, profile) {
        return {
            subscription: {
                id: subscription._id.toString(),
                plan: transaction.amount === PLANS.YEARLY.price ? 'YEARLY' : 'MONTHLY',
                status: subscription.status,
                validFrom: subscription.validFrom,
                validUntil: subscription.validUntil,
            },
            transaction: {
                id: transaction._id.toString(),
                amount: transaction.amount,
                type: transaction.type,
            },
            walletBalance: profile.walletBalance,
            isPremium: profile.isPremium,
        };
    }

    /**
     * Format the wallet/subscription status response.
     */
    static toStatusRes(profile, subscription) {
        return {
            walletBalance: profile?.walletBalance || 0,
            isPremium: profile?.isPremium || false,
            premiumExpiry: profile?.premiumExpiry || null,
            activeSubscription: subscription ? {
                id: subscription._id.toString(),
                status: subscription.status,
                validFrom: subscription.validFrom,
                validUntil: subscription.validUntil,
            } : null,
            plans: PLANS,
        };
    }
}

export { SubscriptionDTO, PLANS };
