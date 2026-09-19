import React, { useState } from 'react';
import {
  Linkedin,
  Twitter,
  FileText,
  ShieldAlert,
  Presentation,
  BarChart,
  Video,
  Copy,
  Check,
  RefreshCw,
  Edit3,
  CheckCircle,
} from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { ValidationBadge } from './ValidationBadge.jsx';
import { ExportMenu } from './ExportMenu.jsx';
import { outputApi } from '../../api/output.api.js';
import toast from 'react-hot-toast';

const ICON_MAP = {
  linkedin: Linkedin,
  twitter: Twitter,
  executive_summary: FileText,
  advisory: ShieldAlert,
  presentation: Presentation,
  infographic: BarChart,
  video_package: Video,
};

const LABEL_MAP = {
  linkedin: 'LinkedIn Post',
  twitter: 'Twitter / X Thread',
  executive_summary: 'Executive Summary',
  advisory: 'Advisory Document',
  presentation: 'Presentation Slides',
  infographic: 'Infographic Content',
  video_package: 'Video Package',
};

export const OutputCard = ({
  output,
  onOpenValidationModal,
  onOpenEditor,
  onOutputUpdated,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const {
    _id,
    outputType,
    structuredData = {},
    renderedText = '',
    validationResult,
    version = 1,
    approvedByUser = false,
  } = output;

  const IconComponent = ICON_MAP[outputType] || FileText;
  const label = LABEL_MAP[outputType] || outputType;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(renderedText);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const res = await outputApi.regenerateOutput(_id);
      toast.success(`Regenerated ${label} with cached canonical model`);
      if (onOutputUpdated) {
        onOutputUpdated(res.data.output);
      }
    } catch (err) {
      toast.error('Failed to regenerate output');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const res = await outputApi.approveOutput(_id);
      toast.success('Output approved');
      if (onOutputUpdated) {
        onOutputUpdated(res.data.output);
      }
    } catch (err) {
      toast.error('Failed to approve');
    } finally {
      setIsApproving(false);
    }
  };

  const renderContentPreview = () => {
    if (!structuredData) {
      return <p className="text-xs text-slate-400 italic">No structured content generated.</p>;
    }

    switch (outputType) {
      case 'linkedin':
        return (
          <div className="space-y-2 text-xs text-slate-700">
            <p className="font-semibold text-slate-900 leading-snug">{structuredData.hook}</p>
            <p className="line-clamp-4 leading-relaxed text-slate-600 whitespace-pre-line">{structuredData.body}</p>
            {structuredData.callToAction && (
              <p className="italic text-blue-700 font-medium">{structuredData.callToAction}</p>
            )}
            <div className="flex flex-wrap gap-1 pt-1">
              {(structuredData.hashtags || []).map((tag, idx) => (
                <span key={idx} className="text-[11px] text-blue-600 font-medium">
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          </div>
        );

      case 'executive_summary':
        return (
          <div className="space-y-2 text-xs text-slate-700">
            <h4 className="font-bold text-slate-900">{structuredData.title}</h4>
            <p className="text-slate-600 line-clamp-2 leading-relaxed">{structuredData.overview}</p>
            <div>
              <span className="font-semibold text-[11px] text-slate-500 uppercase">Key Findings:</span>
              <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-600">
                {(structuredData.keyFindings || []).slice(0, 3).map((kf, i) => (
                  <li key={i} className="truncate">{kf}</li>
                ))}
              </ul>
            </div>
            {structuredData.businessImpact && (
              <p className="text-[11px] text-slate-500 truncate">
                <strong className="text-slate-700">Impact:</strong> {structuredData.businessImpact}
              </p>
            )}
          </div>
        );

      case 'advisory':
        return (
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-bold text-slate-900 truncate">{structuredData.title}</h4>
              {structuredData.severity && (
                <Badge
                  variant={
                    structuredData.severity.toLowerCase().includes('critical') ||
                    structuredData.severity.toLowerCase().includes('high')
                      ? 'danger'
                      : 'warning'
                  }
                  size="sm"
                >
                  {structuredData.severity}
                </Badge>
              )}
            </div>
            {structuredData.tldr && (
              <p className="p-2 bg-slate-50 rounded border border-slate-100 text-slate-700 leading-relaxed text-[11px]">
                <strong>TL;DR:</strong> {structuredData.tldr}
              </p>
            )}
            <div>
              <span className="font-semibold text-[11px] text-slate-500 uppercase">Affected Systems:</span>
              <p className="text-slate-600 truncate mt-0.5">
                {(structuredData.affectedSystems || []).join(', ') || 'Internal infrastructure'}
              </p>
            </div>
          </div>
        );

      case 'presentation':
        const slides = structuredData.slides || [];
        const firstSlide = slides[0];
        return (
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 truncate">{structuredData.title}</h4>
              <Badge variant="primary" size="sm">
                {slides.length} Slides
              </Badge>
            </div>
            {firstSlide && (
              <div className="p-2.5 bg-slate-50 rounded-input border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-blue-600 block">
                  Slide 1: {firstSlide.title}
                </span>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600 text-[11px]">
                  {(firstSlide.bullets || []).slice(0, 2).map((b, idx) => (
                    <li key={idx} className="truncate">{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'twitter':
        const posts = structuredData.posts || [];
        const firstPost = posts[0];
        return (
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Thread ({posts.length} Tweets)</span>
              {firstPost && (
                <span className="text-[11px] text-slate-400">
                  {firstPost.text?.length || 0} / 280 chars
                </span>
              )}
            </div>
            {firstPost && (
              <p className="p-2.5 bg-blue-50/40 rounded-input border border-blue-100 text-slate-800 leading-relaxed text-xs">
                {firstPost.text}
              </p>
            )}
          </div>
        );

      case 'infographic':
        const sections = structuredData.sections || [];
        return (
          <div className="space-y-2 text-xs text-slate-700">
            <h4 className="font-bold text-slate-900">{structuredData.title}</h4>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {sections.slice(0, 2).map((sec, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="font-semibold text-[11px] text-slate-800 block truncate">
                    {sec.heading}
                  </span>
                  <p className="text-[10px] text-blue-600 font-bold mt-0.5 truncate">
                    {sec.statistic || sec.keyMessage}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'video_package':
        return (
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Video Script & Storyboard</span>
              <Badge variant="default" size="sm">
                {structuredData.totalDuration || '1:00 min'}
              </Badge>
            </div>
            <p className="text-slate-600 line-clamp-3 text-xs italic">
              "{structuredData.script || 'Narrator voiceover script generated.'}"
            </p>
          </div>
        );

      default:
        return (
          <p className="text-xs text-slate-600 line-clamp-4 font-mono">
            {renderedText.slice(0, 200)}...
          </p>
        );
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border-slate-200 hover:border-slate-300 shadow-xs">
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 truncate">{label}</h3>
            <span className="text-[10px] text-slate-400">Version {version}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {approvedByUser && (
            <Badge variant="success" size="sm" icon={CheckCircle}>
              Approved
            </Badge>
          )}
          <ValidationBadge
            validationResult={validationResult}
            onClick={() => onOpenValidationModal(output)}
          />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 overflow-hidden">
        {renderContentPreview()}
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between p-3 border-t border-slate-100 bg-slate-50/30 gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenEditor(output)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-input transition-colors"
            title="Edit content with Tiptap"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-input transition-colors"
            title="Copy rendered text"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-input transition-colors disabled:opacity-50"
            title="Regenerate single output using cached canonical model"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-blue-600' : ''}`} />
            <span>Regen</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {!approvedByUser && (
            <button
              type="button"
              onClick={handleApprove}
              disabled={isApproving}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-input hover:bg-green-100 transition-colors"
              title="Approve for publishing"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          )}

          <ExportMenu outputId={_id} outputType={outputType} />
        </div>
      </div>
    </Card>
  );
};
