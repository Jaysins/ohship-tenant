import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings, ChevronDown, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTenantConfig } from '../../context/TenantConfigContext';
import { getPrimaryWallet } from '../../services/walletService';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, features, getBorderRadius } = useTenantConfig();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      setLoadingWallet(true);
      const primaryWallet = await getPrimaryWallet();
      setWallet(primaryWallet);
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoadingWallet(false);
    }
  };

  const formatBalance = (balance, currency) => {
    return `${currency} ${parseFloat(balance).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav
      className="sticky top-0 z-30"
      style={{
        backgroundColor: theme.background.card,
        borderBottom: `1px solid ${theme.border.color}`
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu button (mobile) */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className={`p-2 transition-colors lg:hidden ${getBorderRadius()}`}
              style={{ color: theme.text.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.subtle}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb / Page title - hidden on mobile */}
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                Welcome back, {user?.first_name || 'User'}
              </h1>
            </div>
          </div>

          {/* Right: Wallet, Notifications & User menu */}
          <div className="flex items-center gap-3">
            {/* Wallet Balance */}
            {!loadingWallet && wallet && features.show_wallet_balance && (
              <Link
                to="/transactions"
                className={`hidden sm:flex items-center gap-2 px-3 py-2 transition-colors ${getBorderRadius()}`}
                style={{
                  backgroundColor: `${theme.primary_color}0D`,
                  color: theme.primary_color
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.primary_color}1A`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.primary_color}0D`;
                }}
              >
                <Wallet size={18} />
                <div className="text-left">
                  <p className="text-[10px] font-medium">Wallet Balance</p>
                  <p className="text-sm font-bold">
                    {formatBalance(wallet.balance, wallet.currency)}
                  </p>
                </div>
              </Link>
            )}

            {/* Notifications */}
            <button
              className={`relative p-2 transition-colors ${getBorderRadius()}`}
              style={{ color: theme.text.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.subtle}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Bell size={20} />
              {/* Notification badge */}
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: theme.danger_color }}
              />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-3 p-2 transition-colors ${getBorderRadius()}`}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.subtle}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.primary_color }}
                >
                  <span className="text-sm font-medium text-white">
                    {getInitials(user?.full_name || user?.first_name)}
                  </span>
                </div>

                {/* User info - hidden on mobile */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="text-left">
                    <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                      {user?.full_name || `${user?.first_name} ${user?.last_name}`}
                    </p>
                    <p className="text-xs" style={{ color: theme.text.muted }}>
                      {user?.role || 'User'}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className="transition-transform"
                    style={{
                      color: theme.text.muted,
                      transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </div>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showUserMenu && (
                  <>
                    {/* Backdrop for mobile */}
                    <div
                      className="fixed inset-0 z-40 sm:hidden"
                      onClick={() => setShowUserMenu(false)}
                    />

                    {/* Menu */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute right-0 mt-2 w-56 shadow-lg py-2 z-50 ${getBorderRadius()}`}
                      style={{
                        backgroundColor: theme.background.card,
                        border: `1px solid ${theme.border.color}`
                      }}
                    >
                      {/* User info in dropdown - mobile only */}
                      <div
                        className="px-4 py-3 sm:hidden"
                        style={{ borderBottom: `1px solid ${theme.border.color}` }}
                      >
                        <p className="text-sm font-medium" style={{ color: theme.text.primary }}>
                          {user?.full_name || `${user?.first_name} ${user?.last_name}`}
                        </p>
                        <p className="text-xs" style={{ color: theme.text.muted }}>
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                        style={{ color: theme.text.secondary }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.background.subtle;
                          e.currentTarget.style.color = theme.text.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = theme.text.secondary;
                        }}
                      >
                        <User size={16} />
                        <span>Profile</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                        style={{ color: theme.text.secondary }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.background.subtle;
                          e.currentTarget.style.color = theme.text.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = theme.text.secondary;
                        }}
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>

                      <div className="my-2" style={{ borderTop: `1px solid ${theme.border.color}` }} />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm transition-colors w-full"
                        style={{ color: theme.danger_color }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${theme.danger_color}0D`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <LogOut size={16} />
                        <span>Sign out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
