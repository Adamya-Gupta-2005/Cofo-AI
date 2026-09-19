import mammoth from 'mammoth';
import { ApiError } from '../../utils/ApiError.js';

export const extractDocx = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value || '',
      metadata: {
        warnings: result.messages || [],
      },
    };
  } catch (error) {
    throw new ApiError(400, `Failed to parse DOCX document: ${error.message}`, 'DOCX_PARSE_ERROR');
  }
};
