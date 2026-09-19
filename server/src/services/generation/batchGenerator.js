import { getAIProvider } from '../ai/aiProviderFactory.js';
import { buildPrompt } from '../../prompts/promptBuilder.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

export const generateBatchOutputs = async (canonicalContent, settings, selectedOutputTypes) => {
  logger.info(`[BatchGenerator] Generating outputs for: ${selectedOutputTypes.join(', ')}`);
  
  const { systemPrompt, userMessage } = buildPrompt(canonicalContent, settings, selectedOutputTypes);
  const aiProvider = getAIProvider();

  const maxTokens = Math.min(8000, Math.max(2500, selectedOutputTypes.length * 900));

  try {
    const rawBatchResult = await aiProvider.completeJSON(
      systemPrompt,
      userMessage,
      {
        tier: 'deep',
        temperature: 0.3,
        maxTokens,
      }
    );

    return rawBatchResult;
  } catch (error) {
    logger.error(`[BatchGenerator] Batch generation failed: ${error.message}`);
    throw new ApiError(500, `Batch generation failed: ${error.message}`, 'GENERATION_FAILED');
  }
};
