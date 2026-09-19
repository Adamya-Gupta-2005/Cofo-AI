import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try loading .env from server directory first, then root directory, then cwd
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z
    .union([z.string(), z.number()])
    .default('5000')
    .transform((val) => (typeof val === 'number' ? val : parseInt(val, 10))),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required (e.g. mongodb://localhost:27017/contentforge)'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required (starts with gsk_...)'),
  AI_PROVIDER: z.string().default('groq'),
  MAX_FILE_SIZE_MB: z
    .union([z.string(), z.number()])
    .default('10')
    .transform((val) => (typeof val === 'number' ? val : parseInt(val, 10))),
  RATE_LIMIT_WINDOW_MS: z
    .union([z.string(), z.number()])
    .default('900000')
    .transform((val) => (typeof val === 'number' ? val : parseInt(val, 10))),
  RATE_LIMIT_MAX_REQUESTS: z
    .union([z.string(), z.number()])
    .default('100')
    .transform((val) => (typeof val === 'number' ? val : parseInt(val, 10))),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('\n❌ Invalid environment variables configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    console.error('\n👉 Please create a `.env` file inside `server/.env` with your settings.');
    console.error('👉 You can copy `server/.env.example` to `server/.env` and set your GROQ_API_KEY.\n');
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
