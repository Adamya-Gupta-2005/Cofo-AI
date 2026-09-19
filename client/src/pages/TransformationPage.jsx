import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Topbar } from '../components/layout/Topbar.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { GenerationProgress } from '../components/transformation/GenerationProgress.jsx';
import { OutputCard } from '../components/output/OutputCard.jsx';
import { ValidationReport } from '../components/output/ValidationReport.jsx';
import { OutputEditor } from '../components/output/OutputEditor.jsx';
import { transformationApi } from '../api/transformation.api.js';
import { useTransformationStore } from '../stores/transformationStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { useSSE } from '../hooks/useSSE.js';
import { useExport } from '../hooks/useExport.js';
import toast from 'react-hot-toast';

export const TransformationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    currentTransformation,
    setTransformation,
    outputs,
    setOutputs,
    updateOutput,
    generationProgress,
    updateProgress,
  } = useTransformationStore();

  const {
    validationModalOpen,
    selectedValidationReport,
    openValidationModal,
    closeValidationModal,
    editorModalOpen,
    selectedOutputForEdit,
    openEditorModal,
    closeEditorModal,
  } = useUIStore();

  const { exportAllZip, isExporting } = useExport();

  const [isLoading, setIsLoading] = useState(true);
  const [sourceData, setSourceData] = useState(null);

  // Fetch transformation details
  const fetchDetails = async () => {
    try {
      const res = await transformationApi.getTransformationById(id);
      setTransformation(res.data.transformation);
      setOutputs(res.data.outputs || []);
      setSourceData(res.data.source);
    } catch (error) {
      console.error('Error fetching transformation:', error);
      toast.error('Failed to load transformation results');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Connect SSE for live progress updates
  useSSE(id, (event) => {
    updateProgress(event);
    if (event.type === 'complete' || event.step === 'validating') {
      fetchDetails();
    }
  });

  const isPipelineRunning =
    currentTransformation?.status === 'processing' ||
    currentTransformation?.status === 'queued';

  // Overall Facts Integrity Count
  const totalVerifiedFacts = outputs.reduce(
    (acc, out) => acc + (out.validationResult?.verifiedFactsCount || 0),
    0
  );
  const totalIssues = outputs.reduce(
    (acc, out) => acc + (out.validationResult?.flaggedIssues?.length || 0),
    0
  );

  return (
    <div className="min-h-full pb-16">
      {/* Topbar with Transformation Metadata */}
      <Topbar
        title={
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-input transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="truncate max-w-md">
              {currentTransformation?.title || 'Transformation Results'}
            </span>
          </div>
        }
        subtitle={
          currentTransformation?.settings
            ? `Audience: ${currentTransformation.settings.targetAudience} · Tone: ${currentTransformation.settings.tone} · Detail: ${currentTransformation.settings.levelOfDetail}`
            : 'Multi-format transformation outputs'
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={Download}
              isLoading={isExporting}
              disabled={outputs.length === 0}
              onClick={() => exportAllZip(id, currentTransformation?.title)}
            >
              Download All (ZIP)
            </Button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Integrity Summary Banner */}
        {outputs.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Zero-Distortion Knowledge Model Preservation
                </h4>
                <p className="text-xs text-slate-500">
                  {sourceData?.canonicalContent?.extractedFacts?.length || 0} canonical facts isolated from source document
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="success" size="md" icon={CheckCircle2}>
                {totalVerifiedFacts} Facts Preserved
              </Badge>
              {totalIssues > 0 ? (
                <Badge variant="warning" size="md" icon={AlertTriangle}>
                  {totalIssues} Warning{totalIssues === 1 ? '' : 's'}
                </Badge>
              ) : (
                <Badge variant="success" size="md">
                  100% Exact Anchors
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Real-Time Generation Progress (Visible when processing or in progress) */}
        {(isPipelineRunning || !generationProgress.isComplete && outputs.length === 0) && (
          <GenerationProgress progress={generationProgress} />
        )}

        {/* Output Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Generated Outputs ({outputs.length})
            </h3>
            {isPipelineRunning && (
              <span className="text-xs text-blue-600 flex items-center gap-1.5 font-medium animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Pipeline running...
              </span>
            )}
          </div>

          {outputs.length === 0 && !isPipelineRunning ? (
            <div className="text-center p-12 bg-white rounded-card border border-slate-200 text-slate-500">
              No outputs generated yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outputs.map((output) => (
                <OutputCard
                  key={output._id}
                  output={output}
                  onOpenValidationModal={openValidationModal}
                  onOpenEditor={openEditorModal}
                  onOutputUpdated={(updated) => updateOutput(updated._id, updated)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Validation Report Modal */}
      <ValidationReport
        isOpen={validationModalOpen}
        onClose={closeValidationModal}
        output={selectedValidationReport}
        extractedFacts={sourceData?.canonicalContent?.extractedFacts || []}
      />

      {/* Tiptap Output Editor Modal */}
      <OutputEditor
        isOpen={editorModalOpen}
        onClose={closeEditorModal}
        output={selectedOutputForEdit}
        onSaveSuccess={(updated) => updateOutput(updated._id, updated)}
      />
    </div>
  );
};
