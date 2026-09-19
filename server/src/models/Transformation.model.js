import mongoose from 'mongoose';

const transformationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Source',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
    },
    settings: {
      targetAudience: { type: String, default: 'Executive' },
      tone: { type: String, default: 'Professional' },
      language: { type: String, default: 'en' },
      levelOfDetail: { type: String, default: 'Moderate' },
      communicationObjective: { type: String, default: 'Inform' },
      contentStyle: { type: String, default: 'Formal' },
    },
    selectedOutputTypes: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'partial', 'failed'],
      default: 'queued',
    },
    progress: {
      currentStep: { type: String, default: 'queued' },
      completedOutputs: [{ type: String }],
      failedOutputs: [{ type: String }],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

transformationSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

export const Transformation = mongoose.model('Transformation', transformationSchema);
