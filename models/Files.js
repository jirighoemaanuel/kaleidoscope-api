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

    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
  },
  { timestamps: true }
);

export default mongoose.model('File', FileSchema);