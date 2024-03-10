import express from 'express';
import multer from 'multer';
import path from 'path';

const upload = multer({ dest: 'uploads' });
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  // res.render('index.ejs');
  res.json({ msg: 'Welcome to Keleidoscope API' });
});

app.post('/', upload.single('file'), (req, res) => {
  console.log(req.file);
  res.json({ msg: 'file uploaded successfully' });
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
