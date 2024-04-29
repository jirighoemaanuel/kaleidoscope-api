import express from 'express';
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
app.use(express.static('public'));
app.use(express.json());

// routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/files', authenticateUser, files);

// app.get('/', (req, res) => {
//   res.json({
//     msg: 'Welcome to KaleidoscopeAPI. Make call to endpoint: /kaleidoscope/api/v1/files',
//   });
// });

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
