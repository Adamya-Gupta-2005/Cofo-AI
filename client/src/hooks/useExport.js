import { useState } from 'react';
import toast from 'react-hot-toast';
import { outputApi } from '../api/output.api.js';
import { transformationApi } from '../api/transformation.api.js';

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportSingle = async (outputId, outputType, format = 'txt') => {
    try {
      setIsExporting(true);
      const toastId = toast.loading(`Preparing ${format.toUpperCase()} export...`);
      const blob = await outputApi.exportOutput(outputId, format);
      downloadBlob(blob, `${outputType}.${format}`);
      toast.success(`Exported ${outputType}.${format}`, { id: toastId });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export document. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllZip = async (transformationId, title = 'export') => {
    try {
      setIsExporting(true);
      const toastId = toast.loading('Bundling all outputs into ZIP archive...');
      const blob = await transformationApi.exportAllZip(transformationId);
      downloadBlob(blob, `contentforge-${transformationId}.zip`);
      toast.success('ZIP package downloaded successfully', { id: toastId });
    } catch (error) {
      console.error('Export all error:', error);
      toast.error('Failed to export ZIP archive.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportSingle,
    exportAllZip,
  };
};
