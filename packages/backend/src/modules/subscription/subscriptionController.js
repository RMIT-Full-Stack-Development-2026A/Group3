import SubscriptionService from './subscriptionService.js';
import AuthService from '../auth/authService.js';
import { SubscriptionDTO } from './subscriptionDto.js';
import { responseHelper } from '../../common/responseHelper.js';

const { sendSuccess, sendError } = responseHelper;

class SubscriptionController {
    async topUp(req, res) {
        try {
            const userId = req.user.id;
            const { amount } = SubscriptionDTO.toTopUpReq(req.body);

            const { transaction, newBalance } = await SubscriptionService.topUp(userId, amount);
            const data = SubscriptionDTO.toTopUpRes(transaction, newBalance);

            return sendSuccess(res, 200, data, `Successfully deposited $${amount.toFixed(2)}`);
        } catch (error) {
            console.error('Top-up Error:', error.message);
            return sendError(res, 400, 'TOP_UP_FAILED', error.message);
        }
    }

    async subscribe(req, res) {
        try {
            const userId = req.user.id;
            const plan = SubscriptionDTO.toSubscribeReq(req.body);

            const result = await SubscriptionService.subscribe(userId, plan);
            
            // Generate a fresh token
            const user = await AuthService.getUserById(userId);
            const newToken = AuthService._generateToken(user, result.profile);
            
            const data = SubscriptionDTO.toSubscriptionRes(result.subscription, result.transaction, result.profile);
            data.token = newToken;

            return sendSuccess(res, 201, data, `Premium ${plan.label} plan activated! Confirmation email sent.`);
        } catch (error) {
            console.error('Subscribe Error:', error.message);
            const statusCode = error.message.includes('Insufficient') ? 402 : 400;
            return sendError(res, statusCode, 'SUBSCRIBE_FAILED', error.message);
        }
    }

    async getStatus(req, res) {
        try {
            const userId = req.user.id;
            const { profile, activeSubscription } = await SubscriptionService.getStatus(userId);
            const data = SubscriptionDTO.toStatusRes(profile, activeSubscription);

            return sendSuccess(res, 200, data, 'Subscription status fetched');
        } catch (error) {
            console.error('Status Error:', error.message);
            return sendError(res, 400, 'STATUS_FETCH_FAILED', error.message);
        }
    }
}

export default new SubscriptionController();
