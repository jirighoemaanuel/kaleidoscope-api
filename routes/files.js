import express from 'express';
import multer from 'multer';
import path from 'path';
import mime from 'mime-types';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.route('/file/:fileId').get((req, res) => {
  const fileId = req.params.fileId;
  const filePath = `uploads/${fileId}`;
  const resolvedPath = path.resolve(filePath);
  const mimeType = mime.lookup(resolvedPath);
  res.setHeader('Content-Type', mimeType);
  res.sendFile(resolvedPath, (err) => {
    if (err) {
      console.error(`Error sending file: ${err}`);
      res.status(500).send('Error sending file');
    }
  });
});

router.route('/upload').post(upload.single('file'), (req, res) => {
  const fileId = req.file.filename;
  res.json({ msg: fileId });
});

export default router;
