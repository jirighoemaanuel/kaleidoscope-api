import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema(
  {
    flename: String,
    size: Number,
    uploadDate: Date,
    mimeType: String,
  },
  { timestamps: true }
);

export default mongoose.model(('File', FileSchema));
