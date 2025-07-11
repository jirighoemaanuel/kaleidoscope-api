import path from 'path';
import mime from 'mime-types';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import File from '../models/Files.js';
import { BadRequestError, NotFoundError } from '../errors/index.js';
import { StatusCodes } from 'http-status-codes';

import {
  uploadToBlob,
  downloadBlobToFile,
  deleteBlob,
} from '../utils/cloudinaryStorage.js';

export const getAllFiles = async (req, res) => {
  console.log(`📂 Getting all files for user: ${req.user.userId}`);

  try {
    const files = await File.find({
      createdBy: req.user.userId,
    }).sort({ createdAt: -1 }); // Sort by newest first

    console.log(`📋 Found ${files.length} files for user`);

    // Transform the files to include display names and useful metadata
    const transformedFiles = files.map((file) => ({
      _id: file._id,
      filename: file.filename,
      originalName: file.originalName,
      displayName: file.originalName || file.filename,
      size: file.size,
      mimeType: file.mimeType,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    }));

    res.status(StatusCodes.OK).json({
      files: transformedFiles,
      count: transformedFiles.length,
    });
  } catch (error) {
    console.error('❌ Error fetching files:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: 'Error fetching files',
    });
  }
};

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

  // Generate unique filename with original extension
  const fileId = `${uuidv4()}${path.extname(req.file.originalname)}`;
  const originalFilename = req.file.originalname;

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

  try {
    console.log(
      `☁️ Uploading to Cloudinary: ${fileId} in folder user-${req.user.userId}`
    );

    // Upload the file to Cloudinary using the memory buffer directly
    const cloudinaryResult = await uploadToBlob(
      req.file.buffer, // Use memory buffer instead of reading from disk
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
