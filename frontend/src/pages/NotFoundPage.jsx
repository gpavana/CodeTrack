import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="not-found-page text-center py-20 px-4 max-w-lg mx-auto">
      <div className="text-7xl font-extrabold text-blue-500/80 mb-4 tracking-tighter">404</div>
      <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-slate-400 text-sm mb-6">
        The page you are looking for does not exist, has been removed, or is temporarily unavailable.
      </p>
      <div className="flex justify-center gap-3">
        <Link to="/dashboard" className="btn btn-primary">
          <Home size={16} /> Go to Dashboard
        </Link>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={16} /> Landing Page
        </Link>
      </div>
    </div>
  );
};
