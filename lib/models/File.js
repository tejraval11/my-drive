import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  folder: {
    type: String,
    default: 'root',
    trim: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
fileSchema.index({ userId: 1, folder: 1 });
fileSchema.index({ userId: 1, uploadedAt: -1 });

const File = mongoose.models.File || mongoose.model('File', fileSchema);

export default File; 