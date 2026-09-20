import Groq from 'groq-sdk';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

const MODELS = {
  primary: 'openai/gpt-oss-120b',
  fast:    'openai/gpt-oss-20b',
};

export class GroqProvider {
  constructor() {
    this.client = new Groq({
      apiKey: env.GROQ_API_KEY,
    });
  }

  cleanJSONText(raw) {
    if (!raw) return '{}';
    let text = raw.trim();
    // Remove markdown code block wrappers if present
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }
    return text;
  }

  async complete(systemPrompt, userMessage, options = {}) {
    const model =
      options.tier === 'fast' ? MODELS.fast : (options.model || MODELS.primary);
    const temperature = options.temperature ?? 0.2;
    const max_tokens = options.maxTokens ?? 2000;

    try {
      const response = await this.client.chat.completions.create({
        model,
        temperature,
        max_tokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      logger.warn(`[GroqProvider.complete] Error with ${model}: ${error.message}. Attempting fallback...`);
      if (model !== MODELS.fast) {
        try {
          const fallbackResponse = await this.client.chat.completions.create({
            model: MODELS.fast,
            temperature,
            max_tokens,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
          });
          return fallbackResponse.choices[0]?.message?.content || '';
        } catch (fbError) {
          logger.error(`[GroqProvider.complete] Fallback failed: ${fbError.message}`);
          throw new ApiError(502, `AI completion failed: ${fbError.message}`, 'AI_PROVIDER_ERROR');
        }
      }
      throw new ApiError(502, `AI completion failed: ${error.message}`, 'AI_PROVIDER_ERROR');
    }
  }

  async completeJSON(systemPrompt, userMessage, options = {}) {
    const selectedModel =
      options.tier === 'fast' ? MODELS.fast : (options.model || MODELS.primary);
    const temperature = options.temperature ?? 0.1;
    const max_tokens = options.maxTokens ?? 4000;

    const augmentedSystemPrompt = `${systemPrompt}\n\nRespond ONLY with valid, parseable JSON. Do not include markdown code block formatting or conversational text outside the JSON object.`;

    const attemptCall = async (modelToUse) => {
      const response = await this.client.chat.completions.create({
        model: modelToUse,
        temperature,
        max_tokens,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: augmentedSystemPrompt },
          { role: 'user', content: userMessage },
        ],
      });

      const rawContent = response.choices[0]?.message?.content || '{}';
      const cleaned = this.cleanJSONText(rawContent);

      try {
        return JSON.parse(cleaned);
      } catch (parseError) {
        logger.warn(`[GroqProvider.completeJSON] JSON parse failed on ${modelToUse}, retrying with assistant priming...`);
        const retryResponse = await this.client.chat.completions.create({
          model: modelToUse,
          temperature: 0,
          max_tokens,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: augmentedSystemPrompt },
            { role: 'user', content: userMessage },
            { role: 'assistant', content: 'Here is the JSON:\n{' },
          ],
        });

        let retryContent = this.cleanJSONText(retryResponse.choices[0]?.message?.content || '{}');
        if (!retryContent.startsWith('{')) {
          retryContent = '{' + retryContent;
        }
        return JSON.parse(retryContent);
      }
    };

    try {
      return await attemptCall(selectedModel);
    } catch (primaryError) {
      logger.warn(`[GroqProvider.completeJSON] Error with ${selectedModel}: ${primaryError.message}. Attempting fallback to ${MODELS.fast}...`);
      if (selectedModel !== MODELS.fast) {
        try {
          return await attemptCall(MODELS.fast);
        } catch (fallbackError) {
          logger.error(`[GroqProvider.completeJSON] Fallback failed: ${fallbackError.message}`);
          throw new ApiError(422, `Failed to parse structured JSON from AI response: ${fallbackError.message}`, 'AI_JSON_PARSE_ERROR');
        }
      }
      throw new ApiError(422, `Failed to parse structured JSON from AI response: ${primaryError.message}`, 'AI_JSON_PARSE_ERROR');
    }
  }

  async completeWithImage() {
    throw new ApiError(501, 'Vision not supported with Groq', 'VISION_UNSUPPORTED');
  }
}
