/**
 * Card Component - Layout Building Block for TicTacToang.
 */
export function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-bg border border-border-color rounded-xl shadow-lg transition-all ${
        hover ? 'hover:shadow-[0_0_30px_rgba(244,171,0,0.15)] hover:scale-[1.02] cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
