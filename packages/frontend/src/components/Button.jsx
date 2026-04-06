import { forwardRef } from 'react';

/**
 * Button Component - Interaction Driver with Premium Logic.
 */
export const Button = forwardRef(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';
    
    const variantStyles = {
      primary: 'bg-gradient-to-r from-gold to-gold-light text-black hover:shadow-[0_0_20px_rgba(244,171,0,0.4)] hover:scale-[1.02]',
      secondary: 'border-2 border-teal text-teal hover:bg-teal/10 hover:shadow-[0_0_20px_rgba(0,201,177,0.3)]',
      danger: 'border-2 border-coral text-coral hover:bg-coral/10 hover:shadow-[0_0_20px_rgba(255,107,107,0.3)]',
      ghost: 'border border-border-color text-text-primary hover:bg-surface-bg',
      outline: 'border-2 border-border text-text-primary hover:bg-white/5',
    };
    
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-lg',
    };
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
