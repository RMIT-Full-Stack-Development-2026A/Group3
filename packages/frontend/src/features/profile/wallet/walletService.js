import httpUtil from '../../../shared/utils/httpUtil';

const walletService = {
  /**
   * Top up wallet with a deposit amount.
   */
  topUp: async (amount) => {
    return await httpUtil.post('/subscription/top-up', { amount });
  },

  /**
   * Subscribe to a premium plan (MONTHLY or YEARLY).
   */
  subscribe: async (plan) => {
    return await httpUtil.post('/subscription/subscribe', { plan });
  },

  /**
   * Get current wallet balance and subscription status.
   */
  getStatus: async () => {
    return await httpUtil.get('/subscription/status');
  },
};

export default walletService;
