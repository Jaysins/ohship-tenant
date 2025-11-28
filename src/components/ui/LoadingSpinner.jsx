import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({
  size = 'md',
  text,
  fullScreen = false,
  className = ''
}) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 size={sizes[size]} className="text-indigo-600 animate-spin" />
      {text && <p className="text-sm text-slate-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
