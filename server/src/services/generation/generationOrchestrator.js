import { Source } from '../../models/Source.model.js';
import { Transformation } from '../../models/Transformation.model.js';
import { Output } from '../../models/Output.model.js';
import { analyzeSourceContent } from '../content/contentAnalyzer.js';
import { generateBatchOutputs } from './batchGenerator.js';
import { validateOutput, renderStructuredDataToText } from '../validation/factValidator.js';
import { emitProgress, emitComplete } from '../../utils/sseBroadcaster.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

export const runTransformationPipeline = async (transformationId) => {
  const transformation = await Transformation.findById(transformationId);
  if (!transformation) {
    logger.error(`[Orchestrator] Transformation ${transformationId} not found`);
    return;
  }

  const source = await Source.findById(transformation.sourceId);
  if (!source) {
    transformation.status = 'failed';
    await transformation.save();
    emitProgress(transformationId, {
      type: 'error',
      message: 'Source document not found',
    });
    return;
  }

  try {
    transformation.status = 'processing';
    transformation.progress.currentStep = 'analyzing';
    await transformation.save();

    // Step 2: Content Analysis (Only if not already completed)
    emitProgress(transformationId, {
      type: 'step',
      step: 'analyzing',
      status: 'running',
      message: 'Analyzing source and extracting canonical knowledge model...',
    });

    const canonicalContent = await analyzeSourceContent(source);
    const factCount = canonicalContent?.extractedFacts?.length || 0;

    emitProgress(transformationId, {
      type: 'step',
      step: 'analyzing',
      status: 'done',
      factCount,
      message: `Source analyzed — ${factCount} facts identified`,
    });

    // Step 3: Zero-token prompt building step
    emitProgress(transformationId, {
      type: 'step',
      step: 'building_prompt',
      status: 'done',
      message: 'Enforcing sacred value preservation and prompt safety...',
    });

    // Step 4: Batch Generation (AI Call 2)
    transformation.progress.currentStep = 'generating';
    await transformation.save();

    emitProgress(transformationId, {
      type: 'step',
      step: 'generating',
      status: 'running',
      message: `Generating ${transformation.selectedOutputTypes.length} output formats simultaneously...`,
    });

    const batchResults = await generateBatchOutputs(
      canonicalContent,
      transformation.settings,
      transformation.selectedOutputTypes
    );

    emitProgress(transformationId, {
      type: 'step',
      step: 'generating',
      status: 'done',
      message: 'Generation completed successfully',
    });

    // Step 5: JavaScript Validation (Zero tokens)
    transformation.progress.currentStep = 'validating';
    await transformation.save();

    emitProgress(transformationId, {
      type: 'step',
      step: 'validating',
      status: 'running',
      message: 'Performing deterministic fact validation & citation check...',
    });

    const extractedFacts = canonicalContent.extractedFacts || [];
    const completedOutputs = [];
    const failedOutputs = [];

    // Delete existing outputs for this transformation if re-running
    await Output.deleteMany({ transformationId: transformation._id });

    for (const outputType of transformation.selectedOutputTypes) {
      const structuredData = batchResults[outputType] || null;

      if (!structuredData) {
        failedOutputs.push(outputType);
        continue;
      }

      const validationResult = validateOutput(structuredData, extractedFacts, outputType);
      const renderedText = renderStructuredDataToText(outputType, structuredData);

      const outputDoc = new Output({
        transformationId: transformation._id,
        userId: transformation.userId,
        outputType,
        structuredData,
        renderedText,
        validationResult,
        status: 'completed',
        version: 1,
        versionHistory: [
          {
            version: 1,
            structuredData,
            renderedText,
            createdAt: new Date(),
          },
        ],
      });

      await outputDoc.save();
      completedOutputs.push(outputType);
    }

    emitProgress(transformationId, {
      type: 'step',
      step: 'validating',
      status: 'done',
      message: 'Fact validation completed',
    });

    // Complete transformation
    transformation.status = failedOutputs.length === 0 ? 'completed' : 'partial';
    transformation.progress.completedOutputs = completedOutputs;
    transformation.progress.failedOutputs = failedOutputs;
    transformation.completedAt = new Date();
    await transformation.save();

    emitComplete(transformationId);
    logger.info(`[Orchestrator] Transformation ${transformationId} finished successfully.`);
  } catch (error) {
    logger.error(`[Orchestrator] Pipeline failed for transformation ${transformationId}: ${error.message}`);
    transformation.status = 'failed';
    await transformation.save();
    emitProgress(transformationId, {
      type: 'error',
      message: error.message || 'Generation pipeline failed',
    });
    emitComplete(transformationId);
  }
};

export const regenerateSingleOutput = async (outputId) => {
  const output = await Output.findById(outputId);
  if (!output) throw new ApiError(404, 'Output not found', 'NOT_FOUND');

  const transformation = await Transformation.findById(output.transformationId);
  if (!transformation) throw new ApiError(404, 'Transformation not found', 'NOT_FOUND');

  const source = await Source.findById(transformation.sourceId);
  if (!source || !source.canonicalContent) {
    throw new ApiError(400, 'Canonical content not found on source', 'MISSING_CANONICAL_MODEL');
  }

  // Generate ONLY this output type using cached canonical model
  const singleResult = await generateBatchOutputs(
    source.canonicalContent,
    transformation.settings,
    [output.outputType]
  );

  const structuredData = singleResult[output.outputType];
  if (!structuredData) {
    throw new ApiError(500, 'Failed to regenerate output', 'REGENERATION_FAILED');
  }

  const validationResult = validateOutput(
    structuredData,
    source.canonicalContent.extractedFacts || [],
    output.outputType
  );
  const renderedText = renderStructuredDataToText(output.outputType, structuredData);

  const newVersion = (output.version || 1) + 1;
  output.structuredData = structuredData;
  output.renderedText = renderedText;
  output.validationResult = validationResult;
  output.version = newVersion;
  output.versionHistory.push({
    version: newVersion,
    structuredData,
    renderedText,
    createdAt: new Date(),
  });
  output.status = 'completed';
  output.approvedByUser = false;

  await output.save();
  return output;
};
