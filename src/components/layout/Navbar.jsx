import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings, ChevronDown, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getPrimaryWallet } from '../../services/walletService';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
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
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu button (mobile) */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu size={20} className="text-slate-600" />
            </button>

            {/* Breadcrumb / Page title - hidden on mobile */}
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-slate-900">
                Welcome back, {user?.first_name || 'User'}
              </h1>
            </div>
          </div>

          {/* Right: Wallet, Notifications & User menu */}
          <div className="flex items-center gap-3">
            {/* Wallet Balance */}
            {!loadingWallet && wallet && (
              <Link
                to="/transactions"
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <Wallet size={18} className="text-indigo-600" />
                <div className="text-left">
                  <p className="text-[10px] text-indigo-600 font-medium">Wallet Balance</p>
                  <p className="text-sm font-bold text-indigo-900">
                    {formatBalance(wallet.balance, wallet.currency)}
                  </p>
                </div>
              </Link>
            )}

            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell size={20} className="text-slate-600" />
              {/* Notification badge */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {getInitials(user?.full_name || user?.first_name)}
                  </span>
                </div>

                {/* User info - hidden on mobile */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900">
                      {user?.full_name || `${user?.first_name} ${user?.last_name}`}
                    </p>
                    <p className="text-xs text-slate-500">{user?.role || 'User'}</p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform ${
                      showUserMenu ? 'rotate-180' : ''
                    }`}
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
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50"
                    >
                      {/* User info in dropdown - mobile only */}
                      <div className="px-4 py-3 border-b border-slate-200 sm:hidden">
                        <p className="text-sm font-medium text-slate-900">
                          {user?.full_name || `${user?.first_name} ${user?.last_name}`}
                        </p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User size={16} />
                        <span>Profile</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>

                      <div className="border-t border-slate-200 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
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
