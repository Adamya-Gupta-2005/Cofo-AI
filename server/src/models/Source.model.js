import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    sourceType: {
      type: String,
      enum: ['text', 'pdf', 'docx'],
      required: true,
    },
    rawText: {
      type: String,
      required: [true, 'Raw text content is required'],
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    originalFilename: {
      type: String,
      default: null,
    },
    mimeType: {
      type: String,
      default: null,
    },
    canonicalContent: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    analysisStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

sourceSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

export const Source = mongoose.model('Source', sourceSchema);
