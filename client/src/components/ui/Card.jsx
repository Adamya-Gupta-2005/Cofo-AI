import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({
  children,
  className = '',
  hoverable = false,
  selected = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'bg-white border rounded-card transition-all duration-150',
          selected
            ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm bg-blue-50/20'
            : 'border-slate-200 shadow-xs hover:border-slate-300',
          hoverable && 'cursor-pointer hover:shadow-md',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
