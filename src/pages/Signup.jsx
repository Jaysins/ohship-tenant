import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, Phone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
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

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.trim().length < 1) {
      newErrors.first_name = 'First name must be at least 1 character';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.trim().length < 1) {
      newErrors.last_name = 'Last name must be at least 1 character';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && formData.phone.length > 50) {
      newErrors.phone = 'Phone number must be less than 50 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (formData.password.length > 100) {
      newErrors.password = 'Password must be less than 100 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // Send data matching backend schema
      const signupData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      };

      // Only include phone if provided
      if (formData.phone.trim()) {
        signupData.phone = formData.phone;
      }

      const result = await signup(signupData);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Create your account
          </h1>
          <p className="text-slate-600">
            Start shipping smarter today
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-soft p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* API Error */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm"
              >
                {apiError}
              </motion.div>
            )}

            {/* First Name */}
            <Input
              label="First Name"
              name="first_name"
              type="text"
              placeholder="John"
              value={formData.first_name}
              onChange={handleChange}
              error={errors.first_name}
              leftIcon={<User size={18} />}
              required
              autoComplete="given-name"
            />

            {/* Last Name */}
            <Input
              label="Last Name"
              name="last_name"
              type="text"
              placeholder="Doe"
              value={formData.last_name}
              onChange={handleChange}
              error={errors.last_name}
              leftIcon={<User size={18} />}
              required
              autoComplete="family-name"
            />

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

            {/* Phone (Optional) */}
            <Input
              label="Phone (Optional)"
              name="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              leftIcon={<Phone size={18} />}
              autoComplete="tel"
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
              helperText="At least 8 characters"
              leftIcon={<Lock size={18} />}
              required
              autoComplete="new-password"
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              leftIcon={<Lock size={18} />}
              required
              autoComplete="new-password"
            />

            {/* Terms */}
            <div className="flex items-start gap-2 text-sm pt-2">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
              />
              <label className="text-slate-600">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button - with explicit styling */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                rightIcon={<ArrowRight size={18} />}
              >
                Create account
              </Button>
            </div>
          </form>

          {/* Sign in link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Already have an account? </span>
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
