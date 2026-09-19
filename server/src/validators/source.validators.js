import { z } from 'zod';

export const createSourceTextSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  text: z.string().min(20, 'Source text must be at least 20 characters long'),
  sourceType: z.literal('text').default('text'),
});

export const createSourceFileSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
});
