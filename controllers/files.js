import path from 'path';
import mime from 'mime-types';
import fs from 'fs';

import {
  uploadToBlob,
  downloadBlobToFile,
  deleteBlob,
} from '../utils/azureBlobStorage.js';

export const getFile = async (req, res) => {
  const fileId = req.params.fileId;
  const filePath = `public/downloads/${fileId}`;
  const resolvedPath = path.resolve(filePath);

  try {
    // Download the file from Azure Blob Storage
    await downloadBlobToFile(fileId, resolvedPath);

    const mimeType = mime.lookup(resolvedPath);
    res.setHeader('Content-Type', mimeType);

    res.sendFile(resolvedPath, (err) => {
      if (err) {
        console.error(`Error sending file: ${err}`);
        res.status(500).send('Error sending file');
      } else {
        // Delete the file after sending it
        fs.unlink(resolvedPath, (err) => {
          if (err) console.error(`Error deleting file: ${err}`);
        });
      }
    });
  } catch (err) {
    console.error(`Error getting file: ${err}`);
    res.status(500).send('Error getting file');
  }
};

export const uploadFile = async (req, res) => {
  const fileId = req.file.filename;
  const filePath = `public/uploads/${fileId}`;
  const resolvedPath = path.resolve(filePath);

  try {
    // Ensure the uploads directory exists
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

    // Read the file content
    const content = fs.readFileSync(resolvedPath);

    // Upload the file to Azure Blob Storage
    await uploadToBlob(content, fileId);
    res.json({ msg: `File ${fileId} uploaded successfully` });
  } catch (err) {
    console.error(`Error uploading file: ${err}`);
    res.status(500).json('Error uploading file');
  }
};

export const deleteFile = async (req, res) => {
  const fileId = req.params.fileId;

  try {
    await deleteBlob(fileId);
    res.json({ msg: `File ${fileId} deleted successfully` });
  } catch (err) {
    console.error(`Error deleting file: ${err}`);
    res.status(500).json('Error deleting file');
  }
};
