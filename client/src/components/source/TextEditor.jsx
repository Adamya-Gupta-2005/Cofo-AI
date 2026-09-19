import React from 'react';
import { Trash2 } from 'lucide-react';
import { SampleInputButton } from './SampleInputButton.jsx';

export const TextEditor = ({
  title,
  setTitle,
  text,
  setText,
  onLoadSample,
  disabled = false,
}) => {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document Title (e.g., Ransomware Incident Report)"
          disabled={disabled}
          className="w-full text-sm font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-input focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <SampleInputButton onLoadSample={onLoadSample} />
      </div>

      <div className="relative border border-slate-200 rounded-input focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 bg-white">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          rows={11}
          placeholder="Paste or type raw source text here (e.g., incident report, policy memo, press release, research abstract)..."
          className="w-full p-3 text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 bg-transparent border-none outline-none resize-none"
        />

        {text && (
          <button
            type="button"
            onClick={() => {
              setText('');
              setTitle('');
            }}
            title="Clear text"
            className="absolute top-2.5 right-2.5 p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 bg-slate-50/50 rounded-b-input text-[11px] text-slate-500">
          <div>
            {charCount < 100 ? (
              <span className="text-amber-600 font-medium">
                {100 - charCount} more characters needed for optimal analysis
              </span>
            ) : (
              <span className="text-green-600 font-medium">✓ Ready for canonical extraction</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
        </div>
      </div>
    </div>
  );
};
