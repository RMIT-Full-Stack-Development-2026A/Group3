import SubscriptionRepository from './subscriptionRepository.js';
import ProfileRepository from '../profile/profileRepository.js';
import UsersService from '../users/usersService.js';
import { sendMail, buildPremiumEmail } from '../../common/emailUtil.js';

class SubscriptionService {
    /**
     * Top up the user's wallet balance.
     * Creates a DEPOSIT transaction and increments the wallet balance.
     */
    async topUp(userId, amount) {
        // 1. Create transaction record
        const transaction = await SubscriptionRepository.createTransaction({
            userId,
            type: 'DEPOSIT',
            amount,
            status: 'SUCCESS',
        });

        // 2. Atomically increment wallet balance
        const updatedProfile = await ProfileRepository.incrementWalletBalance(userId, amount);

        if (!updatedProfile) {
            throw new Error('Failed to update wallet balance');
        }

        return { transaction, newBalance: updatedProfile.walletBalance };
    }

    /**
     * Subscribe the user to a Premium plan.
     * Validates balance, deducts cost, creates records, sends email.
     */
    async subscribe(userId, plan) {
        // 1. Get current profile to check balance
        const profile = await ProfileRepository.findProfileByUserId(userId);
        if (!profile) throw new Error('Profile not found. Please complete your profile setup first.');

        // 2. Check sufficient balance
        if (profile.walletBalance < plan.price) {
            throw new Error(`Insufficient balance. You need $${plan.price.toFixed(2)} but only have $${profile.walletBalance.toFixed(2)}. Please top up first.`);
        }

        // 3. Check for existing active subscription
        const existingSub = await SubscriptionRepository.findActiveSubscription(userId);
        if (existingSub) {
            throw new Error(`You already have an active Premium subscription until ${new Date(existingSub.validUntil).toLocaleDateString()}. Cannot purchase a new plan while current one is active.`);
        }

        // 4. Deduct balance
        const newBalance = profile.walletBalance - plan.price;

        // 5. Create SUBSCRIPTION_WALLET transaction
        const transaction = await SubscriptionRepository.createTransaction({
            userId,
            type: 'SUBSCRIPTION_WALLET',
            amount: plan.price,
            status: 'SUCCESS',
        });

        // 6. Create subscription record
        const validFrom = new Date();
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + plan.days);

        const subscription = await SubscriptionRepository.createSubscription({
            userId,
            transactionId: transaction._id,
            validFrom,
            validUntil,
        });

        // 7. Update profile: set isPremium, premiumExpiry, deduct balance
        const updatedProfile = await ProfileRepository.updateProfileByUserId(userId, {
            isPremium: true,
            premiumExpiry: validUntil,
            walletBalance: newBalance,
        });

        // 8. Send confirmation email (non-blocking)
        this._sendConfirmationEmail(userId, plan, transaction.amount, validFrom, validUntil);

        return { subscription, transaction, profile: updatedProfile };
    }

    /**
     * Get the current wallet and subscription status.
     */
    async getStatus(userId) {
        const [profile, activeSubscription] = await Promise.all([
            ProfileRepository.findProfileByUserId(userId),
            SubscriptionRepository.findActiveSubscription(userId),
        ]);

        return { profile, activeSubscription };
    }

    /**
     * Send premium confirmation email asynchronously.
     * Does not throw — failure is logged but doesn't break the flow.
     */
    async _sendConfirmationEmail(userId, plan, amount, validFrom, validUntil) {
        try {
            const user = await UsersService.getPublicById(userId);
            if (!user?.email) return;

            const html = buildPremiumEmail({
                username: user.username,
                plan: plan.label,
                amount,
                validFrom,
                validUntil,
            });

            await sendMail({
                to: user.email,
                subject: '👑 Premium Subscription Activated — TicTacToang',
                html,
            });
        } catch (err) {
            console.error('Failed to send premium email:', err.message);
        }
    }
}

export default new SubscriptionService();
