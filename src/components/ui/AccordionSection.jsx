import React, { useState } from 'react';
import { useTenantConfig } from '../../context/TenantConfigContext';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * AccordionSection Component
 * Collapsible form section with validation status
 *
 * @param {string} title - Section title
 * @param {string} description - Section description
 * @param {boolean} expanded - Is expanded
 * @param {function} onToggle - Toggle handler
 * @param {boolean} completed - Is section completed/valid
 * @param {boolean} hasError - Section has errors
 * @param {React.ReactNode} children - Section content
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Additional CSS classes
 */
const AccordionSection = ({
  title,
  description,
  expanded = false,
  onToggle,
  completed = false,
  hasError = false,
  children,
  disabled = false,
  className = ''
}) => {
  const { theme, getBorderRadius } = useTenantConfig();

  const handleToggle = () => {
    if (!disabled && onToggle) {
      onToggle();
    }
  };

  return (
    <div
      className={`overflow-hidden ${getBorderRadius()} ${className}`}
      style={{
        backgroundColor: theme.background.card,
        border: `1px solid ${hasError ? theme.danger_color : theme.border.color}`,
      }}
    >
      {/* Header */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className="w-full px-5 py-4 flex items-center justify-between gap-3 transition-colors"
        style={{
          backgroundColor: expanded
            ? `${theme.primary_color}10`
            : hasError
            ? `${theme.danger_color}05`
            : theme.background.card,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          {/* Status icon */}
          {completed && !hasError && (
            <CheckCircle size={20} style={{ color: theme.success_color }} />
          )}
          {hasError && (
            <AlertCircle size={20} style={{ color: theme.danger_color }} />
          )}

          {/* Title and description */}
          <div>
            <h3
              className="font-semibold text-base"
              style={{
                color: hasError ? theme.danger_color : theme.text.primary,
              }}
            >
              {title}
            </h3>
            {description && (
              <p className="text-sm mt-0.5" style={{ color: theme.text.muted }}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Toggle icon */}
        {expanded ? (
          <ChevronUp size={20} style={{ color: theme.primary_color }} />
        ) : (
          <ChevronDown size={20} style={{ color: theme.text.muted }} />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div
          className="px-5 py-4"
          style={{
            borderTop: `1px solid ${theme.border.color}`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Accordion Component
 * Manages multiple accordion sections with single-expand mode
 *
 * @param {Array<Object>} sections - Array of section configs
 * @param {string} defaultExpanded - Default expanded section ID
 * @param {boolean} allowMultiple - Allow multiple sections open
 * @param {string} className - Additional CSS classes
 */
export const Accordion = ({
  sections = [],
  defaultExpanded = null,
  allowMultiple = false,
  className = ''
}) => {
  const [expandedSections, setExpandedSections] = useState(
    defaultExpanded ? [defaultExpanded] : []
  );

  const handleToggle = (sectionId) => {
    setExpandedSections(prev => {
      if (allowMultiple) {
        // Toggle in multi-mode
        return prev.includes(sectionId)
          ? prev.filter(id => id !== sectionId)
          : [...prev, sectionId];
      } else {
        // Single mode
        return prev.includes(sectionId) ? [] : [sectionId];
      }
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {sections.map((section) => (
        <AccordionSection
          key={section.id}
          title={section.title}
          description={section.description}
          expanded={expandedSections.includes(section.id)}
          onToggle={() => handleToggle(section.id)}
          completed={section.completed}
          hasError={section.hasError}
          disabled={section.disabled}
        >
          {section.content}
        </AccordionSection>
      ))}
    </div>
  );
};

export default AccordionSection;
