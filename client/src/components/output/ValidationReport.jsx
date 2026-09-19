import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';

export const ValidationReport = ({
  isOpen,
  onClose,
  output,
  extractedFacts = [],
}) => {
  if (!output) return null;

  const validationResult = output.validationResult || {};
  const { status, verifiedFactsCount = 0, flaggedIssues = [], validatedAt } = validationResult;

  const outputText = JSON.stringify(output.structuredData || {}).toLowerCase();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Fact Integrity & Validation Report — ${output.outputType.toUpperCase()}`}
      maxWidth="max-w-3xl"
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Close Report
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Integrity Status
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-slate-900 capitalize">
                  {status === 'pass'
                    ? '100% Fact Preservation'
                    : status === 'warn'
                    ? 'Minor Warnings Identified'
                    : 'Discrepancies Detected'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Validated at</span>
            <span className="text-xs font-medium text-slate-700">
              {validatedAt ? new Date(validatedAt).toLocaleTimeString() : 'Just now'}
            </span>
          </div>
        </div>

        {/* Flagged Issues if any */}
        {flaggedIssues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Flagged Discrepancies ({flaggedIssues.length})</span>
            </h4>
            <div className="space-y-1.5">
              {flaggedIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-red-50/60 border border-red-200 rounded-input flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      {issue.factId && (
                        <span className="font-mono font-bold text-red-800 mr-2">
                          [{issue.factId}]
                        </span>
                      )}
                      <span className="text-slate-800">{issue.issue}</span>
                    </div>
                  </div>
                  <Badge
                    variant={issue.severity === 'error' ? 'danger' : 'warning'}
                    size="sm"
                  >
                    {issue.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Canonical Knowledge Base Verification Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Canonical Facts Verification Checklist ({extractedFacts.length})
            </h4>
            <span className="text-xs text-green-700 font-medium">
              {verifiedFactsCount} Sacred Numbers/Dates Preserved
            </span>
          </div>

          <div className="border border-slate-200 rounded-card divide-y divide-slate-100 max-h-72 overflow-y-auto bg-white">
            {extractedFacts.length === 0 ? (
              <p className="p-4 text-xs text-slate-400 text-center">
                No extracted facts available in canonical knowledge model.
              </p>
            ) : (
              extractedFacts.map((fact) => {
                const isNumeric = ['number', 'date', 'statistic'].includes(fact.category) && fact.value;
                const isPresent = isNumeric
                  ? outputText.includes(fact.value.toLowerCase())
                  : outputText.includes((fact.statement || '').toLowerCase().slice(0, 20));

                return (
                  <div
                    key={fact.factId}
                    className={`p-3 flex items-start justify-between gap-3 text-xs ${
                      isPresent ? 'bg-white' : 'bg-red-50/20'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {isPresent ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-700">
                            {fact.factId}
                          </span>
                          {fact.value && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-medium text-[11px] border border-blue-200">
                              "{fact.value}"
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 uppercase">
                            {fact.category}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed truncate">
                          {fact.statement}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isPresent ? (
                        <span className="text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          Preserved
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Omitted
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
