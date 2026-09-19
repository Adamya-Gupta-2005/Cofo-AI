import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, FileCode, Presentation, Film } from 'lucide-react';
import { useExport } from '../../hooks/useExport.js';

export const ExportMenu = ({ outputId, outputType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { exportSingle, isExporting } = useExport();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getExportFormats = (type) => {
    switch (type) {
      case 'linkedin':
        return [
          { label: 'Plain Text (.txt)', format: 'txt', icon: FileText },
          { label: 'PDF Document (.pdf)', format: 'pdf', icon: FileText },
        ];
      case 'executive_summary':
      case 'advisory':
        return [
          { label: 'PDF Document (.pdf)', format: 'pdf', icon: FileText },
          { label: 'Word Document (.docx)', format: 'docx', icon: FileText },
          { label: 'Plain Text (.txt)', format: 'txt', icon: FileText },
        ];
      case 'presentation':
        return [
          { label: 'PowerPoint Slides (.pptx)', format: 'pptx', icon: Presentation },
          { label: 'JSON Structure (.json)', format: 'json', icon: FileCode },
          { label: 'Plain Text (.txt)', format: 'txt', icon: FileText },
        ];
      case 'twitter':
        return [
          { label: 'Plain Text Thread (.txt)', format: 'txt', icon: FileText },
          { label: 'JSON (.json)', format: 'json', icon: FileCode },
        ];
      case 'infographic':
        return [
          { label: 'JSON Data (.json)', format: 'json', icon: FileCode },
          { label: 'Plain Text Outline (.txt)', format: 'txt', icon: FileText },
        ];
      case 'video_package':
        return [
          { label: 'Subtitles (.srt)', format: 'srt', icon: Film },
          { label: 'Voiceover Script (.txt)', format: 'txt', icon: FileText },
          { label: 'Storyboard Data (.json)', format: 'json', icon: FileCode },
        ];
      default:
        return [
          { label: 'Plain Text (.txt)', format: 'txt', icon: FileText },
          { label: 'JSON (.json)', format: 'json', icon: FileCode },
        ];
    }
  };

  const formats = getExportFormats(outputType);

  const handleExport = (format) => {
    setIsOpen(false);
    exportSingle(outputId, outputType, format);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-input hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
      >
        <Download className="w-3.5 h-3.5 text-slate-500" />
        <span>Export</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-1 w-52 bg-white rounded-card shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            Export Format
          </div>
          {formats.map(({ label, format, icon: Icon }) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors"
            >
              <Icon className="w-3.5 h-3.5 text-slate-400" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
