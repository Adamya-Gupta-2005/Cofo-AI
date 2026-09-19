import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Topbar } from '../components/layout/Topbar.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { TextEditor } from '../components/source/TextEditor.jsx';
import { FileDropzone } from '../components/source/FileDropzone.jsx';
import { OutputSelector } from '../components/transformation/OutputSelector.jsx';
import { GenerationSettings } from '../components/transformation/GenerationSettings.jsx';
import { sourceApi } from '../api/source.api.js';
import { transformationApi } from '../api/transformation.api.js';
import { useTransformationStore } from '../stores/transformationStore.js';
import toast from 'react-hot-toast';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { setTransformation, setSource: setStoreSource, resetProgress } = useTransformationStore();

  // Panel 1: Source State
  const [sourceTab, setSourceTab] = useState('text'); // 'text' | 'file'
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedSource, setAnalyzedSource] = useState(null);

  // Panel 2: Output Selection State
  const [selectedOutputs, setSelectedOutputs] = useState([
    'linkedin',
    'executive_summary',
    'advisory',
  ]);

  // Panel 3: Settings State
  const [settings, setSettings] = useState({
    targetAudience: 'Executive',
    tone: 'Professional',
    language: 'en',
    levelOfDetail: 'Moderate',
    communicationObjective: 'Alert',
    contentStyle: 'Formal',
  });

  // Pipeline Generation State
  const [isGenerating, setIsGenerating] = useState(false);

  // Handler: Load Sample Demo Scenario
  const handleLoadSample = ({ title: demoTitle, text: demoText, selectedOutputs: demoOutputs, settings: demoSettings }) => {
    setTitle(demoTitle);
    setText(demoText);
    setSourceTab('text');
    setSelectedOutputs(demoOutputs);
    setSettings(demoSettings);
    setAnalyzedSource(null);
    toast.success('Demo scenario loaded! Click "Analyze Source" to extract knowledge model.');
  };

  // Handler: Analyze Source (Step 2 AI Call)
  const handleAnalyzeSource = async () => {
    if (sourceTab === 'text' && (!text || text.trim().length < 20)) {
      toast.error('Please enter at least 20 characters of source text.');
      return;
    }
    if (sourceTab === 'file' && !file) {
      toast.error('Please select a PDF, DOCX, or TXT file.');
      return;
    }

    try {
      setIsAnalyzing(true);
      const toastId = toast.loading('Extracting canonical knowledge model & facts...');

      let res;
      if (sourceTab === 'text') {
        res = await sourceApi.createSource({
          title: title || 'Untitled Source Document',
          text: text.trim(),
          sourceType: 'text',
        });
      } else {
        const formData = new FormData();
        formData.append('file', file);
        if (title) formData.append('title', title);
        res = await sourceApi.createSource(formData, true);
      }

      const sourceDoc = res.data.source;
      setAnalyzedSource(sourceDoc);
      setStoreSource(sourceDoc);

      const factCount = sourceDoc.canonicalContent?.extractedFacts?.length || 0;
      toast.success(
        `Source analyzed! ${factCount} sacred facts identified and indexed.`,
        { id: toastId }
      );
    } catch (error) {
      console.error('Source analysis failed:', error);
      const msg = error.response?.data?.message || 'Source analysis failed';
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handler: Generate Batch Outputs (Step 4 AI Call)
  const handleStartTransformation = async () => {
    if (!analyzedSource) {
      toast.error('Please analyze the source document first.');
      return;
    }
    if (selectedOutputs.length === 0) {
      toast.error('Select at least one output format to generate.');
      return;
    }

    try {
      setIsGenerating(true);
      resetProgress();

      const res = await transformationApi.createTransformation({
        sourceId: analyzedSource.id || analyzedSource._id,
        selectedOutputTypes: selectedOutputs,
        settings,
      });

      const transformation = res.data.transformation;
      setTransformation(transformation);

      navigate(`/transformation/${transformation.id}`);
    } catch (error) {
      console.error('Generation initiation error:', error);
      const msg = error.response?.data?.message || 'Failed to start transformation';
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const isSourceReadyToAnalyze =
    sourceTab === 'text' ? text.trim().length >= 20 : !!file;

  return (
    <div className="min-h-full pb-16">
      <Topbar
        title="Transformation Studio"
        subtitle="Zero-distortion fact preservation across multi-channel content"
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Three-Panel Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* PANEL 1: Source Content (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 shadow-xs border-slate-200">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">Source Input</h3>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center p-1 bg-slate-100 rounded-input">
                  <button
                    type="button"
                    onClick={() => setSourceTab('text')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                      sourceTab === 'text'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Type Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceTab('file')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                      sourceTab === 'file'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                </div>
              </div>

              {sourceTab === 'text' ? (
                <TextEditor
                  title={title}
                  setTitle={setTitle}
                  text={text}
                  setText={setText}
                  onLoadSample={handleLoadSample}
                  disabled={isAnalyzing}
                />
              ) : (
                <FileDropzone
                  file={file}
                  setFile={setFile}
                  title={title}
                  setTitle={setTitle}
                  disabled={isAnalyzing}
                />
              )}

              {/* Analysis Trigger & Status */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {analyzedSource ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="md" icon={CheckCircle2}>
                      Source Analyzed — {analyzedSource.canonicalContent?.extractedFacts?.length || 0} facts indexed
                    </Badge>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">
                    Analyze once, reuse canonical facts across all outputs.
                  </span>
                )}

                <Button
                  variant={analyzedSource ? 'outline' : 'primary'}
                  size="sm"
                  onClick={handleAnalyzeSource}
                  disabled={!isSourceReadyToAnalyze || isAnalyzing}
                  isLoading={isAnalyzing}
                  leftIcon={Sparkles}
                >
                  {analyzedSource ? 'Re-Analyze Source' : 'Analyze Source'}
                </Button>
              </div>

              {/* Extracted Topic Snippet */}
              {analyzedSource?.canonicalContent?.topic && (
                <div className="mt-3 p-2.5 bg-blue-50/50 rounded-input border border-blue-100 text-xs text-blue-900">
                  <span className="font-semibold text-blue-950">Topic:</span>{' '}
                  {analyzedSource.canonicalContent.topic}
                </div>
              )}
            </Card>
          </div>

          {/* PANEL 2 & 3: Outputs and Settings (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* PANEL 2: Output Formats */}
            <Card className="p-5 shadow-xs border-slate-200">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-900">Select Output Formats</h3>
              </div>

              <OutputSelector
                selectedOutputs={selectedOutputs}
                setSelectedOutputs={setSelectedOutputs}
                disabled={isGenerating}
              />
            </Card>

            {/* PANEL 3: Generation Parameters */}
            <Card className="p-5 shadow-xs border-slate-200">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <h3 className="text-sm font-bold text-slate-900">Generation Settings</h3>
              </div>

              <GenerationSettings
                settings={settings}
                setSettings={setSettings}
                disabled={isGenerating}
              />
            </Card>

            {/* Generate Action Button */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full py-3.5 text-sm font-semibold shadow-md"
                disabled={!analyzedSource || selectedOutputs.length === 0 || isGenerating}
                isLoading={isGenerating}
                onClick={handleStartTransformation}
                rightIcon={ArrowRight}
              >
                {!analyzedSource
                  ? 'Analyze Source Document to Enable Generation'
                  : selectedOutputs.length === 0
                  ? 'Select at least 1 Output Format'
                  : `Generate ${selectedOutputs.length} Output${
                      selectedOutputs.length === 1 ? '' : 's'
                    } Simultaneously →`}
              </Button>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Single-Pass Groq LLaMA 3.1 70B batch synthesis</span>
                <span>Zero-Token deterministic fact validation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
