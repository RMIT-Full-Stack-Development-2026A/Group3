import React, { useState } from 'react';

const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

const WalletTopUpModal = ({ isOpen, onClose, currentBalance, onTopUp, loading }) => {
  const [amount, setAmount] = useState('');
  const [selectedQuick, setSelectedQuick] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleQuickSelect = (val) => {
    setSelectedQuick(val);
    setAmount(String(val));
    setError('');
  };

  const handleCustomInput = (e) => {
    setSelectedQuick(null);
    setAmount(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!Number.isFinite(numAmount) || numAmount < 1 || numAmount > 10000) {
      setError('Amount must be between $1 and $10,000');
      return;
    }

    try {
      await onTopUp(numAmount);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
        setSelectedQuick(null);
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Top-up failed');
    }
  };

  const handleClose = () => {
    setAmount('');
    setSelectedQuick(null);
    setSuccess(false);
    setError('');
    onClose();
  };

  const parsedAmount = parseFloat(amount) || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative glass-panel w-full max-w-md rounded-2xl border border-outline-variant/15 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Success overlay */}
        {success && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface/95 backdrop-blur-xl">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mb-4 animate-bounce">
              <span className="material-symbols-outlined text-4xl text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h3 className="text-2xl font-extrabold font-headline text-on-surface">Deposit Successful!</h3>
            <p className="text-on-surface-variant mt-1 text-sm">+${parsedAmount.toFixed(2)} added to your wallet</p>
          </div>
        )}

        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-extrabold font-headline tracking-tight text-on-surface">Top Up Wallet</h2>
              <p className="text-on-surface-variant text-xs mt-1">Add funds to your TicTacToang wallet</p>
            </div>
            <button onClick={handleClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-1">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Current Balance */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-highest/60 border border-white/5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Current Balance</span>
              <p className="text-xl font-bold headline-font text-on-surface">${(currentBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Quick select chips */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-3">Quick Select</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickSelect(val)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all active:scale-95 cursor-pointer
                      ${selectedQuick === val
                        ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_12px_rgba(179,161,255,0.15)]'
                        : 'bg-white/[0.03] border-white/5 text-on-surface-variant hover:bg-white/[0.06] hover:border-white/10'
                      }
                    `}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary mb-2">Custom Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-lg">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="10000"
                  value={amount}
                  onChange={handleCustomInput}
                  placeholder="Enter amount"
                  className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl pl-9 pr-4 py-3 text-on-surface text-lg font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-on-surface-variant/40 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            {/* Preview */}
            {parsedAmount > 0 && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-sm">
                <span className="text-on-surface-variant">New Balance</span>
                <span className="font-bold text-emerald-400">${((currentBalance || 0) + parsedAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !parsedAmount || parsedAmount < 1}
              className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-extrabold text-lg tracking-tight shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `Deposit $${parsedAmount > 0 ? parsedAmount.toFixed(2) : '0.00'}`
              )}
            </button>
          </form>
        </div>

        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>
    </div>
  );
};

export default WalletTopUpModal;
