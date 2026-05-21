import { cn } from '../lib/utils.js';

const variantClasses = {
  default: 'bg-gold text-page hover:opacity-90',
  outline: 'border border-border bg-transparent text-text-primary hover:bg-surface-elevated',
  ghost: 'bg-transparent text-text-primary hover:bg-surface-elevated'
};

const sizeClasses = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base'
};

export function Button({
  className,
  variant = 'default',
  size = 'md',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    />
  );
}
