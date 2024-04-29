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

  console.log(resolvedPath);
  // Download the file from Azure Blob Storage
  await downloadBlobToFile(fileId, resolvedPath);

  const mimeType = mime.lookup(resolvedPath);
  res.setHeader('Content-Type', mimeType);

  res.sendFile(resolvedPath, (err) => {
    if (err) {
      console.error(`Error sending file: ${err}`);
      throw new Error('Error sending file');
    } else {
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
  req.body.createdBy = req.user.userId; // Add createdBy to the request body
  const fileId = req.file.filename;
  const filePath = `public/uploads/${fileId}`;
  const resolvedPath = path.resolve(filePath);

  // Add file information to the request body
  req.body.filename = req.file.originalname; // The original name of the file
  req.body.size = req.file.size; // The size of the file in bytes
  req.body.mimeType = req.file.mimetype; // The MIME type of the file

  const file = await File.create(req.body);

  // Ensure the uploads directory exists
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

  // Read the file content
  const content = fs.readFileSync(resolvedPath);

  // Upload the file to Azure Blob Storage
  await uploadToBlob(content, fileId, req.user.userId);
  res.json({ msg: `File ${fileId} uploaded successfully` });
};

export const deleteFile = async (req, res) => {
  const fileId = req.params.fileId;

  await deleteBlob(fileId);
  res.json({ msg: `File ${fileId} deleted successfully` });
};
