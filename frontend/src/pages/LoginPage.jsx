import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      await login(formData.email, formData.password);
      showToast('Welcome back to CodeTrack!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Invalid email or password. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="auth-card-title-section mb-6">
        <h2 className="text-xl font-bold text-white">Welcome Back</h2>
        <p className="text-slate-400 text-sm mt-1">
          Sign in to access your problems, metrics, and revision queue
        </p>
      </div>

      {isExpired && (
        <div className="auth-alert-warning mb-4">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>Your session has expired. Please sign in again.</span>
        </div>
      )}

      {serverError && (
        <div className="auth-alert-error mb-4">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="form-group mb-4">
          <label className="form-label" htmlFor="email">
            Email Address
          </label>
          <div className="input-with-icon">
            <Mail size={18} className="input-icon" />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>
          {errors.email && <p className="form-error-msg">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="form-group mb-6">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              className={`form-input pr-10 ${errors.password ? 'input-error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="form-error-msg">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full justify-center py-2.5 text-base"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <div className="auth-footer mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account yet?{' '}
        <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
          Create Account
        </Link>
      </div>
    </div>
  );
};
