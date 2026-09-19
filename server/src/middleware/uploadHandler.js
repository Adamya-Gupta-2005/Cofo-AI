import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

const storage = multer.memoryStorage();

const allowedMimes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type (${file.mimetype}). Only PDF, DOCX, and TXT are supported.`,
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

export const uploadSingleFile = upload.single('file');
