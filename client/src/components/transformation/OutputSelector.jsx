import React from 'react';
import {
  Linkedin,
  Twitter,
  FileText,
  ShieldAlert,
  Presentation,
  BarChart,
  Video,
  CheckCircle2,
} from 'lucide-react';
import { OUTPUT_TYPES } from '../../utils/constants.js';

const ICON_MAP = {
  Linkedin,
  Twitter,
  FileText,
  ShieldAlert,
  Presentation,
  BarChart,
  Video,
};

export const OutputSelector = ({
  selectedOutputs,
  setSelectedOutputs,
  disabled = false,
}) => {
  const toggleOutput = (id) => {
    if (disabled) return;
    if (selectedOutputs.includes(id)) {
      setSelectedOutputs(selectedOutputs.filter((item) => item !== id));
    } else {
      setSelectedOutputs([...selectedOutputs, id]);
    }
  };

  const selectAll = () => {
    if (disabled) return;
    setSelectedOutputs(OUTPUT_TYPES.map((t) => t.id));
  };

  const clearAll = () => {
    if (disabled) return;
    setSelectedOutputs([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Target Formats ({selectedOutputs.length} selected)
        </span>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={selectAll}
            disabled={disabled}
            className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
          >
            Select All
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={clearAll}
            disabled={disabled}
            className="text-slate-500 hover:text-slate-700 font-medium disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {OUTPUT_TYPES.map((type) => {
          const isSelected = selectedOutputs.includes(type.id);
          const IconComponent = ICON_MAP[type.icon] || FileText;

          return (
            <div
              key={type.id}
              onClick={() => toggleOutput(type.id)}
              className={`relative flex items-start gap-3 p-3 rounded-card border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-blue-50/40 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                }`}
              >
                <IconComponent className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 pr-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                    {type.label}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                  {type.description}
                </p>
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3 text-blue-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
