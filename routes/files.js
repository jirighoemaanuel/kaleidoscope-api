import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Use memory storage to avoid storing files locally
const storage = multer.memoryStorage();

import {
  getFile,
  getAllFiles,
  uploadFile,
  deleteFile,
} from '../controllers/files.js';

const upload = multer({ storage: storage });

const router = express.Router();

router.route('/').get(getAllFiles);

router.route('/:fileId').get(getFile);

router.route('/upload').post(upload.single('file'), uploadFile);

router.route('/:fileId').delete(deleteFile);

export default router;
