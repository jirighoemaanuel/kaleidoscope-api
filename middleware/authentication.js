import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors/index.js';

const auth = (req, res, next) => {
  // Check Header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnauthenticatedError('Authentication invalid');
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the user to the file routes

    req.user = { userId: payload.userId, name: payload.name };
  } catch (error) {
    throw new UnauthenticatedError('Authentication Invalid');
  }
};

export default auth;
