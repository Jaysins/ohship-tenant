import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const Table = ({
  data = [],
  columns = [],
  sortable = true,
  onRowClick,
  emptyMessage = 'No data available'
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleSort = (columnKey) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  };

  const sortedData = getSortedData();

  const SortIcon = ({ columnKey }) => {
    if (!sortable) return null;

    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown size={16} className="text-slate-400" />;
    }

    return sortConfig.direction === 'asc' ? (
      <ChevronUp size={16} className="text-indigo-600" />
    ) : (
      <ChevronDown size={16} className="text-indigo-600" />
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => column.sortable !== false && handleSort(column.key)}
                className={`px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider ${
                  sortable && column.sortable !== false ? 'cursor-pointer hover:bg-slate-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {column.sortable !== false && <SortIcon columnKey={column.key} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={`${
                onRowClick
                  ? 'cursor-pointer hover:bg-slate-50 transition-colors'
                  : ''
              }`}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
