import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';
import { createUserContainer } from '../utils/cloudinaryStorage.js';

export const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();

  // Create user container/folder in Cloudinary
  try {
    await createUserContainer(`user-${user._id}`);
  } catch (error) {
    console.error('Error creating user container:', error);
    // Don't fail registration if container creation fails
  }

  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({ user: { name: user.name }, token });
};
