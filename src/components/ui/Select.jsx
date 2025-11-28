import { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      className = '',
      required = false,
      placeholder = 'Select an option',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'w-full px-4 py-2.5 pr-10 rounded-lg border bg-white text-slate-900 appearance-none transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed';

    const errorStyles = error
      ? 'border-red-300 focus:ring-red-500'
      : 'border-slate-300 hover:border-slate-400';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={`${baseStyles} ${errorStyles} ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {error ? (
              <AlertCircle size={18} className="text-red-500" />
            ) : (
              <ChevronDown size={18} className="text-slate-400" />
            )}
          </div>
        </div>

        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
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

Select.displayName = 'Select';

export default Select;
