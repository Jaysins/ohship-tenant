import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Building2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTenantConfig } from '../context/TenantConfigContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { branding, content, theme, features, links, getBorderRadius } = useTenantConfig();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setApiError(result.error);
      }
    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `linear-gradient(to bottom right, ${theme.background.page}, ${theme.background.subtle})`
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full"
      >
        {/* Header with configurable branding */}
        <div className="text-center mb-8">
          {branding.logo_url ? (
            <div className="flex justify-center mb-4">
              <img
                src={branding.logo_url}
                alt={branding.name}
                className="h-16 w-auto"
              />
            </div>
          ) : (
            <div
              className={`inline-flex items-center justify-center w-16 h-16 mb-4 ${getBorderRadius('2xl')}`}
              style={{
                backgroundColor: `${theme.primary_color}1A` // 10% opacity
              }}
            >
              <Building2
                className="w-8 h-8"
                style={{ color: theme.primary_color }}
              />
            </div>
          )}

          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: theme.text.primary }}
          >
            {content.login_header}
          </h1>
          <p style={{ color: theme.text.secondary }}>
            {content.login_subtitle}
          </p>
        </div>

        {/* Form Card */}
        <div
          className={`shadow-soft p-8 ${getBorderRadius('2xl')}`}
          style={{ backgroundColor: theme.background.card }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* API Error */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 border text-sm ${getBorderRadius()}`}
                style={{
                  backgroundColor: `${theme.danger_color}0D`,
                  borderColor: `${theme.danger_color}33`,
                  color: theme.danger_color
                }}
              >
                {apiError}
              </motion.div>
            )}

            {/* Email */}
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={18} />}
              required
              autoComplete="email"
            />

            {/* Password */}
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock size={18} />}
              required
              autoComplete="current-password"
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              {features.enable_remember_me && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded focus:ring-2"
                    style={{
                      borderColor: theme.border.color,
                      color: theme.primary_color,
                      '--tw-ring-color': theme.primary_color
                    }}
                  />
                  <span style={{ color: theme.text.secondary }}>Remember me</span>
                </label>
              )}
              <Link
                to="/forgot-password"
                className="font-medium hover:underline"
                style={{ color: theme.primary_color }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button - with explicit wrapper */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                rightIcon={<ArrowRight size={18} />}
              >
                Sign in
              </Button>
            </div>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center text-sm">
            <span style={{ color: theme.text.secondary }}>Don't have an account? </span>
            <Link
              to="/signup"
              className="font-semibold hover:underline"
              style={{ color: theme.primary_color }}
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Footer with configurable links */}
        <p
          className="text-center text-sm mt-6"
          style={{ color: theme.text.muted }}
        >
          By signing in, you agree to our{' '}
          <a
            href={links.terms_url}
            className="hover:underline"
            style={{ color: theme.primary_color }}
          >
            Terms of Service
          </a>
          {' '}and{' '}
          <a
            href={links.privacy_url}
            className="hover:underline"
            style={{ color: theme.primary_color }}
          >
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
