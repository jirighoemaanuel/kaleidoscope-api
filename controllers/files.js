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
} from '../utils/cloudinaryStorage.js';

export const getFile = async (req, res) => {
  const fileId = req.params.fileId;

  console.log(`🔍 Looking for file with ID: ${fileId}`);

  // First, find the file in the database to get the actual filename
  const fileRecord = await File.findOne({
    _id: fileId,
    createdBy: req.user.userId,
  });

  console.log(`📄 File record found:`, fileRecord);

  if (!fileRecord) {
    throw new NotFoundError('File not found');
  }

  // Use the filename from the database record for Cloudinary lookup
  const actualFilename = fileRecord.filename;
  const filePath = `public/downloads/${actualFilename}`;
  const resolvedPath = path.resolve(filePath);

  console.log(
    `⬇️ Downloading from Cloudinary: ${actualFilename} to ${resolvedPath}`
  );

  try {
    // Download the file from Cloudinary using the stored filename
    await downloadBlobToFile(
      actualFilename,
      resolvedPath,
      `user-${req.user.userId}`
    );

    const mimeType =
      mime.lookup(resolvedPath) ||
      fileRecord.mimeType ||
      'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileRecord.originalName || actualFilename}"`
    );

    res.sendFile(resolvedPath, (err) => {
      if (err) {
        console.error(`Error sending file: ${err}`);
        throw new NotFoundError('File not found');
      } else {
        console.log(`✅ File sent successfully: ${actualFilename}`);
        res.status(StatusCodes.OK);
        // Delete the temporary file after sending it
        fs.unlink(resolvedPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error(`Error deleting temporary file: ${unlinkErr}`);
          }
        });
      }
    });
  } catch (error) {
    console.error(`Error downloading file: ${error}`);
    throw new NotFoundError('File not found or unable to download');
  }
};

export const uploadFile = async (req, res) => {
  req.body.createdBy = req.user.userId;

  const fileId = req.file.filename; // Generated filename by multer
  const originalFilename = req.file.originalname;
  const filePath = `public/uploads/${fileId}`;
  const resolvedPath = path.resolve(filePath);

  console.log(`📤 Upload details:`);
  console.log(`  - Generated filename (fileId): ${fileId}`);
  console.log(`  - Original filename: ${originalFilename}`);
  console.log(`  - File size: ${req.file.size}`);
  console.log(`  - MIME type: ${req.file.mimetype}`);

  // Store the generated filename (fileId) for Cloudinary consistency
  // but keep original name for display purposes
  req.body.filename = fileId; // Store the actual filename used in Cloudinary
  req.body.originalName = originalFilename; // Store original name for display
  req.body.size = req.file.size;
  req.body.mimeType = req.file.mimetype;

  const file = await File.create(req.body);
  console.log(`📊 Database record created:`, file);

  // Ensure the uploads directory exists
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

  // Read the file content
  const content = fs.readFileSync(resolvedPath);

  try {
    console.log(
      `☁️ Uploading to Cloudinary: ${fileId} in folder user-${req.user.userId}`
    );

    // Upload the file to Cloudinary using the generated filename
    const cloudinaryResult = await uploadToBlob(
      content,
      fileId,
      `user-${req.user.userId}`
    );
    console.log(`✅ Cloudinary upload result:`, cloudinaryResult.public_id);

    res.status(StatusCodes.CREATED).json({
      msg: `File ${originalFilename} uploaded successfully`,
      file: {
        ...file.toObject(),
        displayName: originalFilename,
      },
    });
  } catch (error) {
    console.error(`❌ Cloudinary upload failed:`, error);
    // If Cloudinary upload fails, delete the database record
    await File.findByIdAndDelete(file._id);
    throw error;
  }
};

export const deleteFile = async (req, res) => {
  const fileId = req.params.fileId;

  console.log(`🗑️ Attempting to delete file with ID: ${fileId}`);

  // First, find the file in the database to get the actual filename
  const fileRecord = await File.findOne({
    _id: fileId,
    createdBy: req.user.userId,
  });

  console.log(`📄 File record for deletion:`, fileRecord);

  if (!fileRecord) {
    throw new NotFoundError('File not found');
  }

  try {
    console.log(
      `☁️ Deleting from Cloudinary: ${fileRecord.filename} in folder user-${req.user.userId}`
    );

    // Delete from Cloudinary using the stored filename
    await deleteBlob(fileRecord.filename, `user-${req.user.userId}`);

    console.log(`📊 Deleting from database: ${fileId}`);

    // Delete the record from the database
    await File.findByIdAndDelete(fileId);

    console.log(`✅ File deleted successfully: ${fileRecord.filename}`);

    res.json({
      msg: `File ${
        fileRecord.originalName || fileRecord.filename
      } deleted successfully`,
    });
  } catch (error) {
    console.error(`❌ Error deleting file: ${error}`);
    throw new BadRequestError('Unable to delete file');
  }
};
