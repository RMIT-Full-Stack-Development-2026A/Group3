import { forwardRef } from 'react';

/**
 * Input Component - Reliable Data Capture for Register & Login.
 */
export const Input = forwardRef(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-text-primary font-medium">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 bg-page-bg border border-border-color rounded-lg text-text-primary placeholder-text-secondary transition-all focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent ${
            error ? 'border-coral' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-coral">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
