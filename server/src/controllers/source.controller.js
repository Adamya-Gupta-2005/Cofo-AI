import { Source } from '../models/Source.model.js';
import { routeExtraction } from '../services/extraction/extractorRouter.js';
import { analyzeSourceContent } from '../services/content/contentAnalyzer.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createSource = asyncHandler(async (req, res) => {
  let { title, text, sourceType = 'text' } = req.body;
  let originalFilename = null;
  let mimeType = null;

  if (req.file) {
    const extracted = await routeExtraction(req.file);
    text = extracted.text;
    originalFilename = req.file.originalname;
    mimeType = req.file.mimetype;

    if (!title || title.trim() === '') {
      title = req.file.originalname.replace(/\.[^/.]+$/, '');
    }

    if (req.file.mimetype === 'application/pdf') {
      sourceType = 'pdf';
    } else if (
      req.file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      req.file.mimetype === 'application/msword'
    ) {
      sourceType = 'docx';
    } else {
      sourceType = 'text';
    }
  }

  if (!text || text.trim().length === 0) {
    throw new ApiError(400, 'Source text cannot be empty', 'EMPTY_SOURCE_TEXT');
  }

  const cleanText = text.trim();
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

  const source = await Source.create({
    userId: req.user._id,
    title: title?.trim() || 'Untitled Document',
    sourceType,
    rawText: cleanText,
    wordCount,
    originalFilename,
    mimeType,
    analysisStatus: 'pending',
  });

  // Run analysis
  try {
    await analyzeSourceContent(source);
  } catch (err) {
    // Already flagged as failed inside analyzer
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        source: {
          id: source._id,
          title: source.title,
          sourceType: source.sourceType,
          wordCount: source.wordCount,
          analysisStatus: source.analysisStatus,
          canonicalContent: source.canonicalContent,
          createdAt: source.createdAt,
        },
      },
      'Source created and analyzed successfully'
    )
  );
});

export const getSourceById = asyncHandler(async (req, res) => {
  const source = req.resource; // set by authorize middleware
  return res.status(200).json(new ApiResponse(200, { source }, 'Source retrieved successfully'));
});

export const getSources = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)));
  const skip = (page - 1) * limit;

  const query = { userId: req.user._id, isDeleted: false };

  const [sources, total] = await Promise.all([
    Source.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-rawText'),
    Source.countDocuments(query),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sources,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Sources retrieved successfully'
    )
  );
});

export const analyzeSource = asyncHandler(async (req, res) => {
  const source = req.resource;
  const canonicalContent = await analyzeSourceContent(source);
  return res.status(200).json(
    new ApiResponse(200, { canonicalContent, status: source.analysisStatus }, 'Source analyzed successfully')
  );
});
