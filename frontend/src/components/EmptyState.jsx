import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionLabel,
  actionLink,
  onAction,
}) => {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon-wrapper">
        <Icon size={36} className="text-slate-500" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-primary mt-4">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionLink && (
        <button type="button" onClick={onAction} className="btn btn-primary mt-4">
          {actionLabel}
        </button>
      )}
    </div>
  );
};
