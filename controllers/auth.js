import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '../errors/index.js';
import { createUserContainer } from '../utils/azureBlobStorage.js';

export const register = async (req, res) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();

  // Create a container for the user
  await createUserContainer(user._id);

  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

export const login = async (req, res) => {
  res.send('login user');
};
