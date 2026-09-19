import { Transformation } from '../models/Transformation.model.js';
import { Source } from '../models/Source.model.js';
import { Output } from '../models/Output.model.js';
import { runTransformationPipeline } from '../services/generation/generationOrchestrator.js';
import { registerSSEConnection } from '../utils/sseBroadcaster.js';
import { generateZipArchive } from '../services/export/zipExporter.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createTransformation = asyncHandler(async (req, res) => {
  const { sourceId, selectedOutputTypes, settings } = req.body;

  const source = await Source.findOne({ _id: sourceId, userId: req.user._id, isDeleted: false });
  if (!source) {
    throw new ApiError(404, 'Source document not found', 'SOURCE_NOT_FOUND');
  }

  const transformation = await Transformation.create({
    userId: req.user._id,
    sourceId: source._id,
    title: source.title,
    selectedOutputTypes,
    settings: {
      targetAudience: settings?.targetAudience || 'Executive',
      tone: settings?.tone || 'Professional',
      language: settings?.language || 'en',
      levelOfDetail: settings?.levelOfDetail || 'Moderate',
      communicationObjective: settings?.communicationObjective || 'Inform',
      contentStyle: settings?.contentStyle || 'Formal',
    },
    status: 'queued',
    progress: {
      currentStep: 'queued',
      completedOutputs: [],
      failedOutputs: [],
    },
  });

  // Launch pipeline in background
  setTimeout(() => {
    runTransformationPipeline(transformation._id).catch((err) => {
      console.error('Pipeline asynchronous error:', err);
    });
  }, 100);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        transformation: {
          id: transformation._id,
          status: transformation.status,
          selectedOutputTypes: transformation.selectedOutputTypes,
          title: transformation.title,
        },
      },
      'Transformation queued successfully'
    )
  );
});

export const getTransformationById = asyncHandler(async (req, res) => {
  const transformation = req.resource;
  const outputs = await Output.find({ transformationId: transformation._id });
  const source = await Source.findById(transformation.sourceId).select('title canonicalContent rawText wordCount sourceType');

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        transformation,
        outputs,
        source,
      },
      'Transformation details retrieved'
    )
  );
});

export const getTransformations = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
  const skip = (page - 1) * limit;

  const query = { userId: req.user._id, isDeleted: false };

  const [transformations, total] = await Promise.all([
    Transformation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sourceId', 'title sourceType wordCount'),
    Transformation.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        transformations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Transformations retrieved'
    )
  );
});

export const deleteTransformation = asyncHandler(async (req, res) => {
  const transformation = req.resource;
  transformation.isDeleted = true;
  await transformation.save();

  return res.status(204).send();
});

export const streamProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const transformation = await Transformation.findOne({ _id: id, userId: req.user._id });
  if (!transformation) {
    throw new ApiError(404, 'Transformation not found', 'NOT_FOUND');
  }

  registerSSEConnection(id, res);
});

export const exportAllOutputs = asyncHandler(async (req, res) => {
  const transformation = req.resource;
  const outputs = await Output.find({ transformationId: transformation._id });

  if (!outputs || outputs.length === 0) {
    throw new ApiError(400, 'No generated outputs found for this transformation', 'NO_OUTPUTS');
  }

  const zipBuffer = await generateZipArchive(transformation, outputs);

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="contentforge-export-${transformation._id}.zip"`
  );
  return res.send(zipBuffer);
});
