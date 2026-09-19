import pdfParse from 'pdf-parse';
import { ApiError } from '../../utils/ApiError.js';

export const extractPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return {
      text: data.text || '',
      metadata: {
        pages: data.numpages || 1,
        info: data.info || {},
      },
    };
  } catch (error) {
    throw new ApiError(400, `Failed to parse PDF document: ${error.message}`, 'PDF_PARSE_ERROR');
  }
};
