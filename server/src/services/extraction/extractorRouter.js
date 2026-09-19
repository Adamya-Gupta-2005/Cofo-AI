import { extractPDF } from './pdfExtractor.js';
import { extractDocx } from './docxExtractor.js';
import { ApiError } from '../../utils/ApiError.js';

export const routeExtraction = async (file) => {
  if (!file || !file.buffer) {
    throw new ApiError(400, 'No file buffer provided for extraction', 'EMPTY_FILE');
  }

  const { mimetype, buffer } = file;

  if (mimetype === 'application/pdf') {
    return extractPDF(buffer);
  } else if (
    mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    return extractDocx(buffer);
  } else if (mimetype === 'text/plain') {
    return {
      text: buffer.toString('utf-8'),
      metadata: { encoding: 'utf-8' },
    };
  } else {
    throw new ApiError(400, `Unsupported file MIME type: ${mimetype}`, 'UNSUPPORTED_MIME_TYPE');
  }
};
