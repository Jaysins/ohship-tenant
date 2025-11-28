import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  Package,
  PackageSearch,
  Boxes,
  User,
  FileText,
  Receipt,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Get Quote',
      path: '/quote',
      icon: Calculator
    },
    {
      name: 'Shipments',
      path: '/shipments',
      icon: Boxes
    },
    {
      name: 'Track Package',
      path: '/tracking',
      icon: PackageSearch
    },
    {
      name: 'Transactions',
      path: '/transactions',
      icon: Receipt
    },
    {
      name: 'Documents',
      path: '/documents',
      icon: FileText
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Logo/Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">OhShip</h2>
            <p className="text-xs text-slate-500">Shipping Portal</p>
          </div>
        </div>

        {/* Close button for mobile */}
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
          >
            <X size={20} className="text-slate-600" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-500'} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-xs font-medium text-slate-900 mb-1">Need help?</p>
          <p className="text-xs text-slate-600 mb-3">Contact our support team</p>
          <button className="w-full px-3 py-2 text-xs font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
            Get Support
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile: Show as overlay with animation
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: Always visible
  return (
    <aside className="hidden lg:block w-72 h-screen sticky top-0">
      {sidebarContent}
    </aside>
  );
};

export default Sidebar;
