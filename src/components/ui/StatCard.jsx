import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'indigo',
  loading = false
}) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-slate-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-slate-200 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-medium transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        {Icon && (
          <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center shrink-0`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-semibold text-slate-900 break-words">{value}</h3>

        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColors[trend > 0 ? 'up' : 'down']}`}>
            {trend > 0 ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{Math.abs(trend)}%</span>
            {trendLabel && (
              <span className="text-slate-500 ml-1">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
