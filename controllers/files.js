import path from 'path';
import mime from 'mime-types';
import fs from 'fs';
import File from '../models/Files.js';

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
  const fileId = req.file.filename;
  const filePath = `public/uploads/${fileId}`;
  const resolvedPath = path.resolve(filePath);

  const File = File.create()
  // Ensure the uploads directory exists
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

  // Read the file content
  const content = fs.readFileSync(resolvedPath);

  // Upload the file to Azure Blob Storage
  await uploadToBlob(content, fileId);
  res.json({ msg: `File ${fileId} uploaded successfully` });
};

export const deleteFile = async (req, res) => {
  const fileId = req.params.fileId;

  await deleteBlob(fileId);
  res.json({ msg: `File ${fileId} deleted successfully` });
};
