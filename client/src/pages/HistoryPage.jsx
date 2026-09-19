import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { Topbar } from '../components/layout/Topbar.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { transformationApi } from '../api/transformation.api.js';
import toast from 'react-hot-toast';

export const HistoryPage = () => {
  const [transformations, setTransformations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await transformationApi.getTransformations(1, 50);
      setTransformations(res.data.transformations || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load transformation history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" size="sm" icon={CheckCircle2}>
            Completed
          </Badge>
        );
      case 'processing':
      case 'queued':
        return (
          <Badge variant="primary" size="sm" icon={RefreshCw}>
            Processing
          </Badge>
        );
      case 'partial':
        return (
          <Badge variant="warning" size="sm" icon={AlertCircle}>
            Partial
          </Badge>
        );
      case 'failed':
      default:
        return (
          <Badge variant="danger" size="sm" icon={AlertCircle}>
            Failed
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-full pb-16">
      <Topbar
        title="Transformation History"
        subtitle="Review, inspect validation reports, and export previous deliverables"
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={Plus}
            onClick={() => navigate('/dashboard')}
          >
            New Transformation
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading transformation records...
          </div>
        ) : transformations.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No Transformations Yet"
            description="You have not created any multi-channel transformations yet. Get started by analyzing your first source document."
            actionLabel="Open Studio"
            onAction={() => navigate('/dashboard')}
          />
        ) : (
          <div className="border border-slate-200 rounded-card overflow-hidden bg-white shadow-xs">
            <div className="divide-y divide-slate-100">
              {transformations.map((t) => (
                <div
                  key={t._id}
                  onClick={() => navigate(`/transformation/${t._id}`)}
                  className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {t.title || 'Untitled Transformation'}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span>{t.selectedOutputTypes?.length || 0} formats</span>
                        <span>•</span>
                        <span>
                          {t.settings?.targetAudience} ({t.settings?.tone})
                        </span>
                        <span>•</span>
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {renderStatusBadge(t.status)}
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
