import { useState, useEffect, useCallback } from 'react';
import walletService from './walletService';

export function useWallet() {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await walletService.getStatus();
      setWalletData(res.data || res);
    } catch (err) {
      // Silently handle — wallet status is supplementary to the profile page.
      // The ProfileView falls back to profile data if walletData is null.
      console.warn('Wallet status fetch failed:', err.message);
      setWalletData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTopUp = useCallback(async (amount) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      const res = await walletService.topUp(amount);
      const data = res.data || res;

      // Update local wallet data
      setWalletData(prev => prev ? { ...prev, walletBalance: data.walletBalance } : prev);
      setSuccessMessage(`Successfully deposited $${amount.toFixed(2)}`);
      return data;
    } catch (err) {
      const msg = err.message || err.response?.data?.message || 'Top-up failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const handleSubscribe = useCallback(async (plan) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccessMessage(null);
      const res = await walletService.subscribe(plan);
      const data = res.data || res;

      // Update local wallet data
      setWalletData(prev => prev ? {
        ...prev,
        walletBalance: data.walletBalance,
        isPremium: data.isPremium,
        activeSubscription: data.subscription,
      } : prev);
      setSuccessMessage(`Premium ${plan} plan activated! Check your email for confirmation.`);
      return data;
    } catch (err) {
      const msg = err.message || err.response?.data?.message || 'Subscription failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    walletData,
    loading,
    actionLoading,
    error,
    successMessage,
    handleTopUp,
    handleSubscribe,
    clearMessages,
    refresh: fetchStatus,
  };
}
