import { User } from 'lucide-react';
// Update import path: from ../lib/utils.js to ../lib/utils.js
import { cn } from '../lib/utils.js';

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-24 w-24'
};

export function Avatar({ src, alt = 'Avatar', size = 'md', premium = false, className }) {
  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-full border border-border bg-surface-elevated',
        premium && 'ring-2 ring-gold/70',
        sizeClass,
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-text-secondary">
          <User size={size === 'lg' ? 28 : 18} />
        </div>
      )}
    </div>
  );
}
