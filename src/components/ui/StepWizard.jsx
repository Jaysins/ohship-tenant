import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const StepWizard = ({ steps, currentStep, onStepClick, children }) => {
  return (
    <div className="w-full">
      {/* Step Progress Bar */}
      <div className="mb-6 ml-12 mr-8 -mt-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isClickable = index <= currentStep;

            return (
              <div key={index} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center relative">
                  <button
                    onClick={() => isClickable && onStepClick && onStepClick(index)}
                    disabled={!isClickable}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                      transition-all duration-200 relative z-10
                      ${isCompleted
                        ? 'bg-indigo-600 text-white'
                        : isActive
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                        : 'bg-slate-200 text-slate-500'
                      }
                      ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                    `}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Check size={20} />
                      </motion.div>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </button>

                  {/* Step Label */}
                  <div className="absolute -bottom-8 w-32 text-center">
                    <p
                      className={`text-xs font-medium whitespace-nowrap ${
                        isActive || isCompleted ? 'text-indigo-600' : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 bg-slate-200 relative">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-indigo-600"
                      initial={{ width: '0%' }}
                      animate={{ width: isCompleted ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="mt-16">{children}</div>
    </div>
  );
};

export default StepWizard;
