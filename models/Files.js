import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'please provide a file name'],
      maxLength: 100,
    },

    size: {
      type: Number,
      required: [true, 'please provide a file size'],
    },
    mimeType: String,
  },
  { timestamps: true }
);

export default mongoose.model(('File', FileSchema));
