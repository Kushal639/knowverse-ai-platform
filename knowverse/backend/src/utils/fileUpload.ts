import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';

const ALLOWED_MIME_TYPES = new Set([
  'text/csv',
  'text/tab-separated-values',
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/tsv',
]);

const ALLOWED_EXTENSIONS = new Set(['.csv', '.tsv', '.txt', '.pdf', '.docx', '.doc']);

// Ensure upload directory exists
const uploadDir = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Never use client-provided file names — generate a UUID-based name
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Validate both MIME type and extension
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new AppError(`File type ${ext} not allowed`, 400, 'INVALID_FILE_TYPE'));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
});

export const getFilePath = (filename: string): string => {
  return path.join(uploadDir, filename);
};
