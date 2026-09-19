import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';

export const Topbar = ({ title, subtitle, actions }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 leading-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actions}
        <Badge variant="primary" size="md" icon={Shield}>
          SIH-2026 Ready
        </Badge>
      </div>
    </header>
  );
};
