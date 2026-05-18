import React, { useState } from 'react';

const PLANS = [
  {
    key: 'MONTHLY',
    label: 'Monthly',
    price: 4.99,
    period: '/month',
    days: 30,
    description: '30 days of Premium access',
    badge: null,
  },
  {
    key: 'YEARLY',
    label: 'Yearly',
    price: 49.99,
    period: '/year',
    days: 365,
    description: '365 days of Premium access',
    badge: 'Save 17%',
  },
];

const PREMIUM_FEATURES = [
  { icon: 'smart_toy', text: 'Advanced AI difficulty levels' },
  { icon: 'palette', text: 'Exclusive custom markers & themes' },
  { icon: 'speed', text: 'Priority matchmaking queue' },
  { icon: 'analytics', text: 'Detailed match analytics' },
  { icon: 'workspace_premium', text: 'Premium profile badge' },
  { icon: 'ad_group_off', text: 'Ad-free experience' },
];

const PremiumSubscribeModal = ({ isOpen, onClose, currentBalance, isPremium, premiumExpiry, onSubscribe, loading }) => {
  const [selectedPlan, setSelectedPlan] = useState('YEARLY');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const plan = PLANS.find(p => p.key === selectedPlan);
  const hasEnoughBalance = (currentBalance || 0) >= (plan?.price || 0);

  const handleSubmit = async () => {
    if (!plan) return;
    if (!hasEnoughBalance) {
      setError(`Insufficient balance. You need $${plan.price.toFixed(2)} but only have $${(currentBalance || 0).toFixed(2)}.`);
      return;
    }

    try {
      setError('');
      await onSubscribe(selectedPlan);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Subscription failed');
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError('');
    setSelectedPlan('YEARLY');
    onClose();
  };

  // Already premium view
  if (isPremium && premiumExpiry && new Date(premiumExpiry) > new Date()) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative glass-panel w-full max-w-md rounded-2xl border border-outline-variant/15 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>
            <h2 className="text-2xl font-extrabold font-headline text-on-surface mb-2">You're Premium!</h2>
            <p className="text-on-surface-variant text-sm mb-6">
              Your subscription is active until <span className="text-primary font-bold">{new Date(premiumExpiry).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </p>
            <div className="space-y-3 mb-6">
              {PREMIUM_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-left px-4 py-2 rounded-lg bg-white/[0.03]">
                  <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                  <span className="text-sm text-on-surface">{f.text}</span>
                  <span className="material-symbols-outlined text-emerald-400 text-sm ml-auto">check</span>
                </div>
              ))}
            </div>
            <button onClick={handleClose} className="w-full py-3 rounded-xl bg-surface-container-high border border-outline-variant text-on-surface font-bold hover:bg-surface-bright transition-colors active:scale-95 cursor-pointer">
              Close
            </button>
          </div>
          <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative glass-panel w-full max-w-lg rounded-2xl border border-outline-variant/15 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Success overlay */}
        {success && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface/95 backdrop-blur-xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center mb-4 animate-bounce">
              <span className="text-4xl">👑</span>
            </div>
            <h3 className="text-2xl font-extrabold font-headline text-on-surface mb-2">Welcome to Premium!</h3>
            <p className="text-on-surface-variant text-sm mb-1">Your {plan?.label} plan is now active.</p>
            <p className="text-primary text-xs font-medium mb-6">A confirmation email has been sent to your inbox 📧</p>
            <button onClick={handleClose} className="px-8 py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold hover:shadow-primary/20 active:scale-95 transition-all cursor-pointer">
              Awesome!
            </button>
          </div>
        )}

        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">👑</span>
                <h2 className="text-2xl font-extrabold font-headline tracking-tight text-on-surface">Go Premium</h2>
              </div>
              <p className="text-on-surface-variant text-xs">Unlock the full TicTacToang experience</p>
            </div>
            <button onClick={handleClose} className="text-on-surface-variant hover:text-on-surface transition-colors p-1">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {PLANS.map((p) => {
              const isSelected = selectedPlan === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => { setSelectedPlan(p.key); setError(''); }}
                  className={`
                    relative p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.98] cursor-pointer
                    ${isSelected
                      ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(179,161,255,0.1)]'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                    }
                  `}
                >
                  {p.badge && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-md bg-secondary text-[10px] font-bold text-surface uppercase tracking-wider">
                      {p.badge}
                    </span>
                  )}
                  <span className={`text-xs font-bold uppercase tracking-widest ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {p.label}
                  </span>
                  <div className="mt-2 flex items-baseline gap-0.5">
                    <span className={`text-3xl font-extrabold headline-font ${isSelected ? 'text-on-surface' : 'text-on-surface/80'}`}>
                      ${p.price}
                    </span>
                    <span className="text-xs text-on-surface-variant">{p.period}</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1.5">{p.description}</p>
                  {/* Selection dot */}
                  <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary' : 'border-white/20'}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Features */}
          <div className="mb-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Premium Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {PREMIUM_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
                  <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                  <span className="text-[11px] text-on-surface-variant">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Balance info */}
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm mb-4 ${hasEnoughBalance ? 'bg-white/[0.02] border-white/5' : 'bg-rose-500/5 border-rose-500/15'}`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-on-surface-variant">account_balance_wallet</span>
              <span className="text-on-surface-variant">Your Balance</span>
            </div>
            <span className={`font-bold ${hasEnoughBalance ? 'text-on-surface' : 'text-rose-400'}`}>
              ${(currentBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {!hasEnoughBalance && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-amber-400 text-xs mb-4">
              <span className="material-symbols-outlined text-base">info</span>
              Insufficient funds. Please top up at least ${((plan?.price || 0) - (currentBalance || 0)).toFixed(2)} more.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-4">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !hasEnoughBalance}
            className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-extrabold text-lg tracking-tight shadow-lg hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Activating Premium...
              </span>
            ) : (
              `Subscribe for $${plan?.price?.toFixed(2) || '0.00'}`
            )}
          </button>
        </div>

        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
      </div>
    </div>
  );
};

export default PremiumSubscribeModal;
