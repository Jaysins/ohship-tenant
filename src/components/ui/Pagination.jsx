import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTenantConfig } from '../../context/TenantConfigContext';

/**
 * Pagination Component
 * Displays pagination controls with page numbers and navigation
 *
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {number} totalItems - Total number of items
 * @param {number} itemsPerPage - Number of items per page
 * @param {function} onPageChange - Callback when page changes
 * @param {function} onItemsPerPageChange - Callback when items per page changes
 * @param {array} itemsPerPageOptions - Available items per page options
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100]
}) => {
  const { theme, getBorderRadius } = useTenantConfig();

  // Calculate the range of items being displayed
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add pages around current page
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1 && !onItemsPerPageChange) {
    return null; // Don't show pagination if there's only one page and no items per page selector
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Items info and per-page selector */}
      <div className="flex items-center gap-4">
        {totalItems > 0 && (
          <p className="text-sm" style={{ color: theme.text.secondary }}>
            Showing <span className="font-medium" style={{ color: theme.text.primary }}>{startItem}</span> to{' '}
            <span className="font-medium" style={{ color: theme.text.primary }}>{endItem}</span> of{' '}
            <span className="font-medium" style={{ color: theme.text.primary }}>{totalItems}</span> results
          </p>
        )}

        {onItemsPerPageChange && itemsPerPageOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm" style={{ color: theme.text.secondary }}>
              Per page:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className={`px-3 py-1.5 text-sm border ${getBorderRadius()} outline-none`}
              style={{
                backgroundColor: theme.background.card,
                color: theme.text.primary,
                borderColor: theme.border.color
              }}
              onFocus={(e) => {
                e.target.style.outline = `2px solid ${theme.primary_color}`;
                e.target.style.outlineOffset = '0px';
                e.target.style.borderColor = 'transparent';
              }}
              onBlur={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = theme.border.color;
              }}
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 ${getBorderRadius()} transition-all`}
            style={{
              backgroundColor: theme.background.card,
              color: currentPage === 1 ? theme.text.muted : theme.text.primary,
              border: `1px solid ${theme.border.color}`,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (currentPage !== 1) {
                e.currentTarget.style.backgroundColor = theme.background.subtle;
                e.currentTarget.style.borderColor = theme.primary_color;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.card;
              e.currentTarget.style.borderColor = theme.border.color;
            }}
          >
            <ChevronLeft size={18} />
          </button>

          {/* Page numbers */}
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-sm"
                  style={{ color: theme.text.muted }}
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[36px] px-3 py-2 text-sm font-medium ${getBorderRadius()} transition-all`}
                style={{
                  backgroundColor: isActive ? theme.primary_color : theme.background.card,
                  color: isActive ? '#ffffff' : theme.text.primary,
                  border: `1px solid ${isActive ? theme.primary_color : theme.border.color}`
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = theme.background.subtle;
                    e.currentTarget.style.borderColor = theme.primary_color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = theme.background.card;
                    e.currentTarget.style.borderColor = theme.border.color;
                  }
                }}
              >
                {page}
              </button>
            );
          })}

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 ${getBorderRadius()} transition-all`}
            style={{
              backgroundColor: theme.background.card,
              color: currentPage === totalPages ? theme.text.muted : theme.text.primary,
              border: `1px solid ${theme.border.color}`,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (currentPage !== totalPages) {
                e.currentTarget.style.backgroundColor = theme.background.subtle;
                e.currentTarget.style.borderColor = theme.primary_color;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.card;
              e.currentTarget.style.borderColor = theme.border.color;
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
