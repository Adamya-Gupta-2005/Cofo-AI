import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';

export const ValidationBadge = ({ validationResult, onClick }) => {
  if (!validationResult) {
    return (
      <Badge variant="default" size="sm" icon={Clock}>
        Validating
      </Badge>
    );
  }

  const { status, verifiedFactsCount = 0, flaggedIssues = [] } = validationResult;
  const issueCount = flaggedIssues.length;

  if (status === 'pass') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="cursor-pointer transition-transform active:scale-95"
      >
        <Badge
          variant="success"
          size="sm"
          icon={CheckCircle2}
          className="hover:bg-green-100"
        >
          ✓ {verifiedFactsCount} facts verified
        </Badge>
      </button>
    );
  }

  if (status === 'warn') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="cursor-pointer transition-transform active:scale-95"
      >
        <Badge
          variant="warning"
          size="sm"
          icon={AlertTriangle}
          className="hover:bg-amber-100"
        >
          ⚠ {issueCount} {issueCount === 1 ? 'warning' : 'warnings'}
        </Badge>
      </button>
    );
  }

  if (status === 'fail') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="cursor-pointer transition-transform active:scale-95"
      >
        <Badge
          variant="danger"
          size="sm"
          icon={XCircle}
          className="hover:bg-red-100"
        >
          ✗ {issueCount} {issueCount === 1 ? 'issue' : 'issues'} detected
        </Badge>
      </button>
    );
  }

  return (
    <Badge variant="default" size="sm">
      Pending
    </Badge>
  );
};
