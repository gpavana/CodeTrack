import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStatusInfo = (st) => {
    switch (st) {
      case 'SOLVED':
        return { label: 'Solved', className: 'badge-solved' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', className: 'badge-in-progress' };
      case 'NEEDS_REVISION':
        return { label: 'Needs Revision', className: 'badge-needs-revision' };
      case 'TODO':
      default:
        return { label: 'To Do', className: 'badge-todo' };
    }
  };

  const { label, className } = getStatusInfo(status);

  return (
    <span className={`badge ${className}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
};
