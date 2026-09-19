import { Output } from '../models/Output.model.js';
import { Transformation } from '../models/Transformation.model.js';
import { regenerateSingleOutput } from '../services/generation/generationOrchestrator.js';
import { renderStructuredDataToText, validateOutput } from '../services/validation/factValidator.js';
import { Source } from '../models/Source.model.js';
import { generatePDF } from '../services/export/pdfExporter.js';
import { generateDocx } from '../services/export/docxExporter.js';
import { generatePPTX } from '../services/export/pptxExporter.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getOutputById = asyncHandler(async (req, res) => {
  const output = req.resource;
  return res.status(200).json(new ApiResponse(200, { output }, 'Output retrieved successfully'));
});

export const updateOutput = asyncHandler(async (req, res) => {
  const output = req.resource;
  const { structuredData, renderedText } = req.body;

  const transformation = await Transformation.findById(output.transformationId);
  const source = await Source.findById(transformation.sourceId);

  const updatedData = structuredData || output.structuredData;
  const updatedRendered = renderedText || renderStructuredDataToText(output.outputType, updatedData);

  // Re-validate against canonical facts
  const validationResult = validateOutput(
    updatedData,
    source?.canonicalContent?.extractedFacts || [],
    output.outputType
  );

  const newVersion = (output.version || 1) + 1;
  output.structuredData = updatedData;
  output.renderedText = updatedRendered;
  output.validationResult = validationResult;
  output.version = newVersion;
  output.versionHistory.push({
    version: newVersion,
    structuredData: updatedData,
    renderedText: updatedRendered,
    createdAt: new Date(),
  });

  await output.save();

  return res.status(200).json(new ApiResponse(200, { output }, 'Output updated successfully'));
});

export const regenerateOutput = asyncHandler(async (req, res) => {
  const output = req.resource;
  const updatedOutput = await regenerateSingleOutput(output._id);
  return res.status(200).json(new ApiResponse(200, { output: updatedOutput }, 'Output regenerated successfully'));
});

export const approveOutput = asyncHandler(async (req, res) => {
  const output = req.resource;
  output.approvedByUser = true;
  output.status = 'approved';
  await output.save();

  return res.status(200).json(new ApiResponse(200, { output }, 'Output approved successfully'));
});

export const exportOutput = asyncHandler(async (req, res) => {
  const output = req.resource;
  const { format = 'txt' } = req.query;

  const transformation = await Transformation.findById(output.transformationId);
  const title = `${transformation?.title || 'ContentForge'} - ${output.outputType}`;

  switch (format.toLowerCase()) {
    case 'pdf': {
      const buffer = await generatePDF(title, output.outputType, output.structuredData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${output.outputType}.pdf"`);
      return res.send(buffer);
    }

    case 'docx': {
      const buffer = await generateDocx(title, output.outputType, output.structuredData);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${output.outputType}.docx"`);
      return res.send(buffer);
    }

    case 'pptx': {
      const buffer = await generatePPTX(title, output.structuredData);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${output.outputType}.pptx"`);
      return res.send(buffer);
    }

    case 'json': {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${output.outputType}.json"`);
      return res.send(JSON.stringify(output.structuredData, null, 2));
    }

    case 'srt': {
      let srtContent = '';
      if (output.outputType === 'video_package' && output.structuredData?.subtitles) {
        srtContent = output.structuredData.subtitles
          .map((sub, idx) => `${idx + 1}\n${sub.startTime || '00:00:00,000'} --> ${sub.endTime || '00:00:05,000'}\n${sub.text || ''}\n`)
          .join('\n');
      }
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${output.outputType}.srt"`);
      return res.send(srtContent);
    }

    case 'txt':
    default: {
      const text = renderStructuredDataToText(output.outputType, output.structuredData);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${output.outputType}.txt"`);
      return res.send(text);
    }
  }
});
