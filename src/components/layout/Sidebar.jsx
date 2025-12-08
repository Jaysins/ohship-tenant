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
import { useTenantConfig } from '../../context/TenantConfigContext';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const { branding, theme, content, getBorderRadius } = useTenantConfig();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Get Quote',
      path: '/quote/create',
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
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: theme.background.card,
        borderRight: `1px solid ${theme.border.color}`
      }}
    >
      {/* Logo/Header */}
      <div
        className="flex items-center justify-between p-6"
        style={{ borderBottom: `1px solid ${theme.border.color}` }}
      >
        <div className="flex items-center gap-3">
          {branding.logo_url ? (
            <img
              src={branding.logo_url}
              alt={branding.name}
              className="w-10 h-10 object-contain"
            />
          ) : (
            <div
              className={`w-10 h-10 flex items-center justify-center ${getBorderRadius()}`}
              style={{ backgroundColor: theme.primary_color }}
            >
              <Package className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold" style={{ color: theme.text.primary }}>
              {branding.name}
            </h2>
            <p className="text-xs" style={{ color: theme.text.muted }}>
              {branding.tagline}
            </p>
          </div>
        </div>

        {/* Close button for mobile */}
        {isMobile && (
          <button
            onClick={onClose}
            className={`p-2 transition-colors lg:hidden ${getBorderRadius()}`}
            style={{
              ':hover': { backgroundColor: theme.background.subtle }
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.subtle}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} style={{ color: theme.text.secondary }} />
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
                `flex items-center gap-3 px-4 py-3 transition-all duration-200 font-medium ${getBorderRadius()}`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? `${theme.primary_color}1A` : 'transparent',
                color: isActive ? theme.primary_color : theme.text.secondary
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.backgroundColor = theme.background.subtle;
                  e.currentTarget.style.color = theme.text.primary;
                }
              }}
              onMouseLeave={(e) => {
                const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.text.secondary;
                }
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} style={{ color: isActive ? theme.primary_color : theme.text.muted }} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: `1px solid ${theme.border.color}` }}>
        <div
          className={`p-4 ${getBorderRadius()}`}
          style={{ backgroundColor: theme.background.subtle }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: theme.text.primary }}>
            {content.support_text}
          </p>
          <p className="text-xs mb-3" style={{ color: theme.text.secondary }}>
            {content.support_subtext}
          </p>
          <button
            className={`w-full px-3 py-2 text-xs font-medium transition-colors ${getBorderRadius()}`}
            style={{
              color: theme.primary_color,
              backgroundColor: theme.background.card,
              border: `1px solid ${theme.primary_color}33`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${theme.primary_color}0D`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.background.card;
            }}
          >
            {content.support_button}
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
