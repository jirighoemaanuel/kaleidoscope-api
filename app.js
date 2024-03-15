import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

import files from './routes/files.js';

// Middleware
app.use(express.static('public'));
app.use(express.json());

app.use('/kaleidoscope/api/v1/files', files);



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
