import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?._id,
  });

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      details: err.details || [],
    });
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'Resource';
    return res.status(409).json({
      success: false,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
      errorCode: 'DUPLICATE_KEY',
      details: [],
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Session has expired or is invalid. Please log in again.',
      errorCode: 'INVALID_TOKEN',
      details: [],
    });
  }

  // Multer Errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      errorCode: 'UPLOAD_ERROR',
      details: [],
    });
  }

  // Default fallback (no sensitive stacks exposed)
  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred.',
    errorCode: 'INTERNAL_ERROR',
    details: [],
  });
};
