import React from 'react';

export const DifficultyBadge = ({ difficulty }) => {
  const getDifficultyInfo = (diff) => {
    switch (diff) {
      case 'HARD':
        return { label: 'Hard', className: 'badge-hard' };
      case 'MEDIUM':
        return { label: 'Medium', className: 'badge-medium' };
      case 'EASY':
      default:
        return { label: 'Easy', className: 'badge-easy' };
    }
  };

  const { label, className } = getDifficultyInfo(difficulty);

  return <span className={`badge ${className}`}>{label}</span>;
};
