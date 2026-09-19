import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export const FileDropzone = ({
  file,
  setFile,
  title,
  setTitle,
  disabled = false,
}) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const selected = acceptedFiles[0];
        setFile(selected);
        if (!title) {
          setTitle(selected.name.replace(/\.[^/.]+$/, ''));
        }
      }
    },
    [setFile, title, setTitle]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
  });

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document Title (e.g., Q3 Incident Post-Mortem)"
          disabled={disabled}
          className="w-full text-sm font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-input focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-card p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-800 mb-1">
            {isDragActive ? 'Drop file here...' : 'Drag & drop source document here'}
          </p>
          <p className="text-xs text-slate-500 mb-3">
            Supports PDF, Microsoft Word (.docx), and Plain Text (.txt) up to 10MB
          </p>
          <Button variant="outline" size="sm" type="button" disabled={disabled}>
            Browse Files
          </Button>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                {file.name}
              </p>
              <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            disabled={disabled}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-input transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
