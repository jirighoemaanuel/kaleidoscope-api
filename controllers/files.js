import path from 'path';
import mime from 'mime-types';
import fs from 'fs';
import File from '../models/Files.js';
import { BadRequestError, NotFoundError } from '../errors/index.js';
import { StatusCodes } from 'http-status-codes';

import {
  uploadToBlob,
  downloadBlobToFile,
  deleteBlob,
} from '../utils/azureBlobStorage.js';

export const getFile = async (req, res) => {
  const fileId = req.params.fileId;
  const filePath = `public/downloads/${fileId}`;
  const resolvedPath = path.resolve(filePath);

  // Download the file from Azure Blob Storage
  await downloadBlobToFile(fileId, resolvedPath, `user-${req.user.userId}`);

  const mimeType = mime.lookup(resolvedPath);
  res.setHeader('Content-Type', mimeType);

  res.sendFile(resolvedPath, (err) => {
    if (err) {
      throw new NotFoundError('File not found');
    } else {
      res.status(StatusCodes.OK);
      // Delete the file after sending it
      fs.unlink(resolvedPath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err}`);
          throw new Error('Error deleting file');
        }
      });
    }
  });
};

export const uploadFile = async (req, res) => {
  req.body.createdBy = req.user.userId;

  const fileId = req.file.filename;
  const filePath = `public/uploads/${fileId}`;
  const resolvedPath = path.resolve(filePath);

  // Add file information to the request body
  req.body.filename = req.file.originalname;
  req.body.size = req.file.size;
  req.body.mimeType = req.file.mimetype;
da
  const file = await File.create(req.body);

  // Ensure the uploads directory exists
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

  // Read the file content
  const content = fs.readFileSync(resolvedPath);

  // Upload the file to Azure Blob Storage
  await uploadToBlob(content, fileId, `user-${req.user.userId}`);
  res
    .status(StatusCodes.CREATED)
    .json({ msg: `File ${fileId} uploaded successfully`, file });
};

export const deleteFile = async (req, res) => {
  const fileId = req.params.fileId;

  await deleteBlob(fileId);
  res.json({ msg: `File ${fileId} deleted successfully` });
};
