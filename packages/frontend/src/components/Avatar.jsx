/**
 * Avatar Component - Premium TicTacToang Member Identification.
 */
export function Avatar({ src, alt = 'Avatar', premium = false, size = 'md', className = '' }) {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };
  
  const ringColor = premium ? 'ring-gold' : 'ring-text-secondary';
  
  return (
    <div className={`${sizeStyles[size]} rounded-full ring-2 ${ringColor} overflow-hidden bg-elevated-bg ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-text-primary font-bold">
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
