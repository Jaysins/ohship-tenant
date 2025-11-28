import { useState } from 'react';
import { motion } from 'framer-motion';

const Tabs = ({ tabs = [], defaultTab = 0, onChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index);
    }
  };

  return (
    <div>
      {/* Tab Headers */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab, index) => {
            const isActive = activeTab === index;
            return (
              <button
                key={index}
                onClick={() => handleTabChange(index)}
                className={`relative py-4 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon && (
                  <span className="inline-flex items-center mr-2">
                    {tab.icon}
                  </span>
                )}
                {tab.label}

                {/* Badge */}
                {tab.badge && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    {tab.badge}
                  </span>
                )}

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;
