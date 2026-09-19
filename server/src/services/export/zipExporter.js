import archiver from 'archiver';
import { PassThrough } from 'stream';
import { generatePDF } from './pdfExporter.js';
import { generateDocx } from './docxExporter.js';
import { generatePPTX } from './pptxExporter.js';
import { renderStructuredDataToText } from '../validation/factValidator.js';

export const generateZipArchive = async (transformation, outputs = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const stream = new PassThrough();
      const chunks = [];

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
      archive.on('error', (err) => reject(err));

      archive.pipe(stream);

      const baseFolder = `contentforge-export-${transformation._id}`;

      for (const output of outputs) {
        const { outputType, structuredData } = output;
        const title = transformation.title || 'ContentForge Export';

        if (outputType === 'linkedin') {
          const text = renderStructuredDataToText('linkedin', structuredData);
          archive.append(text, { name: `${baseFolder}/linkedin.txt` });
        } else if (outputType === 'twitter') {
          const text = renderStructuredDataToText('twitter', structuredData);
          archive.append(text, { name: `${baseFolder}/twitter-thread.txt` });
        } else if (outputType === 'executive_summary') {
          const pdfBuf = await generatePDF('Executive Summary - ' + title, 'executive_summary', structuredData);
          archive.append(pdfBuf, { name: `${baseFolder}/executive-summary.pdf` });
          const docxBuf = await generateDocx('Executive Summary - ' + title, 'executive_summary', structuredData);
          archive.append(docxBuf, { name: `${baseFolder}/executive-summary.docx` });
        } else if (outputType === 'advisory') {
          const pdfBuf = await generatePDF('Security Advisory - ' + title, 'advisory', structuredData);
          archive.append(pdfBuf, { name: `${baseFolder}/advisory.pdf` });
          const docxBuf = await generateDocx('Security Advisory - ' + title, 'advisory', structuredData);
          archive.append(docxBuf, { name: `${baseFolder}/advisory.docx` });
        } else if (outputType === 'presentation') {
          const pptxBuf = await generatePPTX(title, structuredData);
          archive.append(pptxBuf, { name: `${baseFolder}/presentation.pptx` });
          archive.append(JSON.stringify(structuredData, null, 2), {
            name: `${baseFolder}/presentation-data.json`,
          });
        } else if (outputType === 'infographic') {
          archive.append(JSON.stringify(structuredData, null, 2), {
            name: `${baseFolder}/infographic-content.json`,
          });
          const text = renderStructuredDataToText('infographic', structuredData);
          archive.append(text, { name: `${baseFolder}/infographic.txt` });
        } else if (outputType === 'video_package') {
          const script = structuredData.script || '';
          const narration = (structuredData.scenes || []).map((s) => s.narration || '').join('\n\n');
          const subtitles = (structuredData.subtitles || [])
            .map((sub, idx) => `${idx + 1}\n${sub.startTime || '00:00:00,000'} --> ${sub.endTime || '00:00:05,000'}\n${sub.text || ''}\n`)
            .join('\n');

          archive.append(script, { name: `${baseFolder}/video-package/script.txt` });
          archive.append(narration, { name: `${baseFolder}/video-package/narration.txt` });
          archive.append(subtitles, { name: `${baseFolder}/video-package/subtitles.srt` });
          archive.append(JSON.stringify(structuredData.scenes || [], null, 2), {
            name: `${baseFolder}/video-package/storyboard.json`,
          });
        }
      }

      await archive.finalize();
    } catch (error) {
      reject(error);
    }
  });
};
