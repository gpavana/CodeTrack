import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="auth-container">
      <div className="auth-card-wrapper">
        <div className="auth-brand-header text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="brand-logo-badge">
              <Code2 size={24} className="text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Code<span className="text-blue-400">Track</span>
            </span>
          </Link>
          <p className="text-slate-400 text-sm">
            Coding Practice & Revision Management Platform
          </p>
        </div>
        <div className="auth-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
