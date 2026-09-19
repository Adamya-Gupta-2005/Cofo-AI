import Groq from 'groq-sdk';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

export class GroqProvider {
  constructor() {
    this.client = new Groq({
      apiKey: env.GROQ_API_KEY,
    });
  }

  async complete(systemPrompt, userMessage, options = {}) {
    const model =
      options.tier === 'fast' ? 'llama-3.1-8b-instant' : 'llama-3.1-70b-versatile';
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
      logger.error(`[GroqProvider.complete] Error: ${error.message}`);
      throw new ApiError(502, `AI completion failed: ${error.message}`, 'AI_PROVIDER_ERROR');
    }
  }

  async completeJSON(systemPrompt, userMessage, options = {}) {
    const model =
      options.tier === 'fast' ? 'llama-3.1-8b-instant' : 'llama-3.1-70b-versatile';
    const temperature = options.temperature ?? 0.1;
    const max_tokens = options.maxTokens ?? 4000;

    const augmentedSystemPrompt = `${systemPrompt}\n\nRespond ONLY with valid, parseable JSON. Do not include markdown code block formatting or explanations outside the JSON structure.`;

    try {
      const response = await this.client.chat.completions.create({
        model,
        temperature,
        max_tokens,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: augmentedSystemPrompt },
          { role: 'user', content: userMessage },
        ],
      });

      const rawContent = response.choices[0]?.message?.content || '{}';
      try {
        return JSON.parse(rawContent);
      } catch (parseError) {
        logger.warn(`[GroqProvider.completeJSON] Initial parse failed, retrying with assistant priming...`);
        // Retry with temperature 0 and assistant priming
        const retryResponse = await this.client.chat.completions.create({
          model,
          temperature: 0,
          max_tokens,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: augmentedSystemPrompt },
            { role: 'user', content: userMessage },
            { role: 'assistant', content: 'Here is the JSON:\n{' },
          ],
        });

        let retryContent = retryResponse.choices[0]?.message?.content || '{}';
        if (!retryContent.trim().startsWith('{')) {
          retryContent = '{' + retryContent;
        }
        return JSON.parse(retryContent);
      }
    } catch (error) {
      logger.error(`[GroqProvider.completeJSON] Failed completely: ${error.message}`);
      throw new ApiError(422, `Failed to parse structured JSON from AI response: ${error.message}`, 'AI_JSON_PARSE_ERROR');
    }
  }

  async completeWithImage() {
    throw new ApiError(501, 'Vision not supported with Groq', 'VISION_UNSUPPORTED');
  }
}
