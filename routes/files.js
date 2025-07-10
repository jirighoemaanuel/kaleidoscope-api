import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    // Generate a unique filename while preserving the extension
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

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
