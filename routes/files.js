import express from 'express';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

import { getFile, uploadFile } from '../controllers/files.js';

const upload = multer({ storage: storage });

const router = express.Router();

router.route('/:fileId').get(getFile);

router.route('/upload').post(upload.single('file'), uploadFile);

export default router;
