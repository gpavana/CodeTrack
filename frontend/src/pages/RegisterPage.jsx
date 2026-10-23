import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await register(formData.fullName, formData.email, formData.password);
      showToast('Account created successfully! Welcome to CodeTrack.', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="auth-card-title-section mb-6">
        <h2 className="text-xl font-bold text-white">Create your account</h2>
        <p className="text-slate-400 text-sm mt-1">
          Begin organizing and mastering your coding interview problems
        </p>
      </div>

      {serverError && (
        <div className="auth-alert-error mb-4">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="form-group mb-4">
          <label className="form-label" htmlFor="fullName">
            Full Name
          </label>
          <div className="input-with-icon">
            <User size={18} className="input-icon" />
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="e.g. Alex Morgan"
              className={`form-input ${errors.fullName ? 'input-error' : ''}`}
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          {errors.fullName && <p className="form-error-msg">{errors.fullName}</p>}
        </div>

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
              required
            />
          </div>
          {errors.email && <p className="form-error-msg">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="form-group mb-4">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
              className={`form-input pr-10 ${errors.password ? 'input-error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
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

        {/* Confirm Password */}
        <div className="form-group mb-6">
          <label className="form-label" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              className={`form-input pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="form-error-msg">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full justify-center py-2.5 text-base"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      <div className="auth-footer mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
          Sign In
        </Link>
      </div>
    </div>
  );
};
