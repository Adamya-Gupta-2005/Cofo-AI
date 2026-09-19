import { z } from 'zod';

export const createTransformationSchema = z.object({
  sourceId: z.string().min(1, 'Source ID is required'),
  selectedOutputTypes: z.array(z.string()).min(1, 'Select at least one output format'),
  settings: z
    .object({
      targetAudience: z.string().optional(),
      tone: z.string().optional(),
      language: z.string().optional(),
      levelOfDetail: z.string().optional(),
      communicationObjective: z.string().optional(),
      contentStyle: z.string().optional(),
    })
    .optional(),
});

export const updateOutputSchema = z.object({
  structuredData: z.record(z.any()),
});
