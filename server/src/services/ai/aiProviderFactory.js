import { GroqProvider } from './GroqProvider.js';
import { env } from '../../config/env.js';

let instance = null;

export const getAIProvider = () => {
  if (!instance) {
    if (env.AI_PROVIDER === 'groq') {
      instance = new GroqProvider();
    } else {
      instance = new GroqProvider();
    }
  }
  return instance;
};
