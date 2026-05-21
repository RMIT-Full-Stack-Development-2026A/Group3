import { cn } from '../lib/utils.js';

const variantClasses = {
  default: 'border border-border bg-surface-elevated text-text-primary',
  success: 'border border-teal/30 bg-teal/15 text-teal-light',
  danger: 'border border-coral/35 bg-coral/15 text-coral',
  secondary: 'border border-border bg-page text-text-secondary'
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    />
  );
}
