import mongoose from 'mongoose';

const extractedFactSchema = new mongoose.Schema(
  {
    factId: { type: String, required: true }, // e.g., FACT-001
    statement: { type: String, required: true },
    value: { type: String, default: '' },
    category: {
      type: String,
      enum: ['number', 'date', 'entity', 'claim', 'statistic', 'general'],
      default: 'general',
    },
    criticality: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
    },
    mandatoryIn: [{ type: String }],
  },
  { _id: false }
);

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
      topic: { type: String },
      summary: { type: String },
      keyFacts: [{ type: String }],
      entities: [{ name: String, type: String }],
      statistics: [{ type: String }],
      risks: [{ type: String }],
      recommendations: [{ type: String }],
      claims: [{ type: String }],
      communicationIntent: { type: String },
      domain: { type: String },
      extractedFacts: [extractedFactSchema],
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
