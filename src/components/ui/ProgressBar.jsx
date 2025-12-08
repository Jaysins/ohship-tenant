import React from 'react';
import { useTenantConfig } from '../../context/TenantConfigContext';

/**
 * ProgressBar Component
 * Visual indicator for multi-step processes
 *
 * @param {number} currentStep - Current step number (1-based)
 * @param {number} totalSteps - Total number of steps
 * @param {Array<string>} stepLabels - Optional labels for each step
 * @param {string} className - Additional CSS classes
 */
const ProgressBar = ({
  currentStep = 1,
  totalSteps = 4,
  stepLabels = [],
  className = ''
}) => {
  const { theme } = useTenantConfig();

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* Step indicator text */}
      <p className="mb-2 text-sm font-medium" style={{ color: theme.text.secondary }}>
        Step {currentStep} of {totalSteps}
        {stepLabels[currentStep - 1] && (
          <span className="ml-1">- {stepLabels[currentStep - 1]}</span>
        )}
      </p>

      {/* Progress bar container */}
      <div
        className="flex w-full h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: theme.background.subtle }}
      >
        {/* Progress fill */}
        <div
          className="h-1.5 rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: theme.primary_color,
          }}
        />
      </div>

      {/* Optional: Step dots */}
      {stepLabels.length > 0 && (
        <div className="flex justify-between mt-3">
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isPending = stepNumber > currentStep;

            return (
              <div key={index} className="flex flex-col items-center" style={{ width: `${100 / totalSteps}%` }}>
                {/* Step circle */}
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: isCompleted || isCurrent
                      ? theme.primary_color
                      : theme.background.subtle,
                    color: isCompleted || isCurrent
                      ? '#ffffff'
                      : theme.text.muted,
                    border: isCurrent ? `2px solid ${theme.primary_color}` : 'none',
                  }}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>

                {/* Step label */}
                <span
                  className="mt-2 text-xs text-center hidden sm:block"
                  style={{
                    color: isCurrent ? theme.primary_color : theme.text.muted,
                    fontWeight: isCurrent ? '600' : '400',
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
