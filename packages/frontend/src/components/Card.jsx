import { cn } from '../lib/utils.js';

export function Card({ className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface',
        hover && 'hover:bg-surface-elevated',
        className
      )}
      {...props}
    />
  );
}
