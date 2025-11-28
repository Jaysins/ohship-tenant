import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className = '',
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

    // Variant styles - using explicit color values
    const variants = {
      primary:
        'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 active:bg-indigo-800 shadow-sm',
      secondary:
        'bg-slate-600 text-white hover:bg-slate-700 focus:ring-slate-500 active:bg-slate-800 shadow-sm',
      outline:
        'bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-500 active:bg-slate-100',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-500 active:bg-slate-200',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800 shadow-sm',
      success:
        'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800 shadow-sm',
    };

    // Size styles
    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    };

    // Width style
    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {loading && (
          <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="animate-spin" />
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
