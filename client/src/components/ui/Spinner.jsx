import React from 'react';
import { clsx } from 'clsx';

export const Spinner = ({ size = 'md', color = 'blue', className = '' }) => {
  const sizes = {
    sm: 'w-3.5 h-3.5 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-3',
  };

  const colors = {
    blue: 'border-blue-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    slate: 'border-slate-600 border-t-transparent',
  };

  return (
    <div
      className={clsx(
        'inline-block animate-spin rounded-full shrink-0',
        sizes[size],
        colors[color],
        className
      )}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
