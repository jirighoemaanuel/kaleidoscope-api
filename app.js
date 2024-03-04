import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h1>Welcome to Keleidoscope API</h1>');
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
