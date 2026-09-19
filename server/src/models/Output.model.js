import mongoose from 'mongoose';

const flaggedIssueSchema = new mongoose.Schema(
  {
    factId: { type: String, default: null },
    issue: { type: String, required: true },
    severity: { type: String, enum: ['warning', 'error'], default: 'warning' },
  },
  { _id: false }
);

const versionHistorySchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    structuredData: { type: mongoose.Schema.Types.Mixed },
    renderedText: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const outputSchema = new mongoose.Schema(
  {
    transformationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transformation',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    outputType: {
      type: String,
      required: true,
    },
    structuredData: {
      type: mongoose.Schema.Types.Mixed,
    },
    renderedText: {
      type: String,
      default: '',
    },
    validationResult: {
      status: {
        type: String,
        enum: ['pass', 'warn', 'fail', 'pending'],
        default: 'pending',
      },
      verifiedFactsCount: {
        type: Number,
        default: 0,
      },
      flaggedIssues: [flaggedIssueSchema],
      validatedAt: {
        type: Date,
      },
    },
    version: {
      type: Number,
      default: 1,
    },
    versionHistory: [versionHistorySchema],
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed', 'approved'],
      default: 'generating',
    },
    approvedByUser: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

outputSchema.index({ transformationId: 1, outputType: 1 });

export const Output = mongoose.model('Output', outputSchema);
