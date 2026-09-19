import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Spinner } from './Spinner.jsx';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 shadow-sm',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus:ring-slate-400 border border-slate-200',
    outline:
      'bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-300 focus:ring-blue-500 shadow-xs',
    demo:
      'bg-amber-50 text-amber-800 hover:bg-amber-100 active:bg-amber-200 border border-amber-300 focus:ring-amber-500 shadow-xs font-semibold',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-300',
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs rounded-input gap-1.5',
    md: 'px-3.5 py-2 text-sm rounded-input gap-2',
    lg: 'px-5 py-2.5 text-base rounded-input gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" color={variant === 'primary' || variant === 'danger' ? 'white' : 'blue'} />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
    </button>
  );
};
