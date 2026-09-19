import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './Button.jsx';

export const EmptyState = ({
  icon: Icon = Sparkles,
  title = 'No items found',
  description = 'Get started by creating your first transformation.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-slate-300 rounded-card">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
