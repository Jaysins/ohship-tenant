import { PackageOpen } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No data found',
  description,
  action,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Icon size={32} className="text-slate-400" />
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-slate-600 text-center max-w-sm mb-6">
          {description}
        </p>
      )}

      {(action || (actionLabel && onAction)) && (
        <div>
          {action || (
            <Button onClick={onAction} variant="primary">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
