import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading...', size = 32, fullPage = false }) => {
  const content = (
    <div className="loading-spinner-wrapper">
      <Loader2 size={size} className="spinner-icon animate-spin text-blue-500" />
      {message && <p className="loading-message text-slate-400 mt-2 text-sm">{message}</p>}
    </div>
  );

  if (fullPage) {
    return <div className="loading-full-page">{content}</div>;
  }

  return content;
};
