/**
 * Badge Component - Real-time Status and Role Indicators for TicTacToang.
 */
export function Badge({ children, variant = 'premium', className = '' }) {
  const variantStyles = {
    premium: 'bg-gradient-to-r from-gold to-gold-light text-black',
    online: 'bg-teal text-black',
    waiting: 'bg-[#FFB800] text-black',
    active: 'bg-teal text-black',
    deactivated: 'bg-text-secondary text-page-bg',
    win: 'bg-teal text-black',
    lose: 'bg-coral text-white',
    draw: 'bg-text-secondary text-page-bg',
    success: 'bg-teal text-black', // Alias for win
    danger: 'bg-coral text-white',  // Alias for lose
  };
  
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
