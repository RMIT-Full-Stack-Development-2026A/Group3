import { cn } from '../lib/utils.js';

export function Input({
  label,
  id,
  error,
  className,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={cn(
          'w-full rounded-lg border border-border bg-page px-4 py-3 text-text-primary outline-none transition-colors placeholder:text-text-secondary/70 focus:border-gold',
          error && 'border-danger focus:border-danger',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
