import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon: Icon,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[11px] gap-1',
    md: 'px-2 py-1 text-xs gap-1.5',
    lg: 'px-2.5 py-1 text-sm gap-1.5',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium rounded-badge border select-none',
          variants[variant],
          sizes[size],
          className
        )
      )}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
