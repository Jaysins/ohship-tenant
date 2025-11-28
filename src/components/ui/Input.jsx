import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = '',
      required = false,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'w-full px-4 py-2.5 rounded-lg border bg-white text-slate-900 placeholder-slate-400 transition-all duration-200 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed';

    const errorStyles = error
      ? 'border-danger-300 focus:ring-danger-500'
      : 'border-slate-300 hover:border-slate-400';

    const iconPaddingLeft = leftIcon ? 'pl-11' : '';
    const iconPaddingRight = rightIcon ? 'pr-11' : '';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={`${baseStyles} ${errorStyles} ${iconPaddingLeft} ${iconPaddingRight} ${className}`}
            {...props}
          />

          {rightIcon && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}

          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-danger-500">
              <AlertCircle size={18} />
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-danger-600 flex items-center gap-1">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
