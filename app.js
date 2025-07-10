import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import connectDB from './db/connect.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// routers
import files from './routes/files.js';
import auth from './routes/auth.js';

import authenticateUser from './middleware/authentication.js';
// error handler
import notFoundMiddleware from './middleware/not-found.js';
import errorHandlerMiddleware from './middleware/error-handler.js';

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/files', authenticateUser, files);

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const server = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server running at port:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

server();
