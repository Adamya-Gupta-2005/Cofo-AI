import React from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Spinner } from '../ui/Spinner.jsx';

export const GenerationProgress = ({ progress }) => {
  const steps = [
    {
      id: 'analyzing',
      label: 'Analyzing Source Document',
      description: 'Extracting structured entities, numbers, dates & facts',
      extra: progress.factCount > 0 ? `${progress.factCount} canonical facts isolated` : null,
    },
    {
      id: 'building_prompt',
      label: 'Compiling Zero-Token Prompt',
      description: 'Enforcing sacred value preservation & prompt injection defense',
    },
    {
      id: 'generating',
      label: 'Generating Multi-Format Outputs',
      description: 'Single-pass Groq LLaMA 3.1 70B parallel synthesis',
    },
    {
      id: 'validating',
      label: 'Deterministic Fact Validation',
      description: 'Deterministic anchor checking, coverage ratio & citations',
    },
  ];

  const renderStatusIcon = (status) => {
    if (status === 'done') {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    if (status === 'running') {
      return <Spinner size="sm" color="blue" />;
    }
    if (status === 'error') {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
    return <Circle className="w-5 h-5 text-slate-300" />;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-card p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span>Transformation Pipeline</span>
            {!progress.isComplete && !progress.error && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 animate-pulse">
                Live SSE Stream
              </span>
            )}
            {progress.isComplete && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-green-50 text-green-700">
                Completed
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Streaming real-time execution steps from backend orchestrator
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const status = progress.steps[step.id] || 'idle';
          const isRunning = status === 'running';
          const isDone = status === 'done';

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3.5 p-3 rounded-input transition-all ${
                isRunning
                  ? 'bg-blue-50/60 border border-blue-200 shadow-xs'
                  : isDone
                  ? 'bg-slate-50/70 border border-slate-100'
                  : 'bg-white border border-transparent'
              }`}
            >
              <div className="mt-0.5">{renderStatusIcon(status)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isRunning
                        ? 'text-blue-900'
                        : isDone
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {idx + 1}. {step.label}
                  </span>
                  {step.extra && (
                    <span className="text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                      {step.extra}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {progress.error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-input flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Pipeline Execution Failed</p>
            <p className="mt-0.5">{progress.error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
