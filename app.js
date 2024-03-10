import express from 'express';
import multer from 'multer';
import path from 'path';
import mime from 'mime-types';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  const fileId = req.file.filename;
  res.json({ msg: fileId });
});

app.get('/file/:fileId', (req, res) => {
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

const server = () => {
  try {
    app.listen(port, () => {
      console.log(`Server running at port:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

server();
