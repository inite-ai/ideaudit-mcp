import { computeUrgencyComposite } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  newsSignalScore: z.number().min(0).max(10),
  painSignalScore: z.number().min(0).max(10),
  hiringSignalScore: z.number().min(0).max(10),
});
import { defineSpec } from '../types.js';

export const computeUrgencyCompositeSpec = defineSpec({
  name: 'compute_urgency_composite',
  description:
    'Compose composite_urgency_score (0-10) + badge (LOW/MEDIUM/HIGH/VERY_HIGH/EXTREME) from 3 sub-scores: news, pain, hiring.',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      newsSignalScore: { type: 'number', minimum: 0, maximum: 10 },
      painSignalScore: { type: 'number', minimum: 0, maximum: 10 },
      hiringSignalScore: { type: 'number', minimum: 0, maximum: 10 },
    },
    required: ['newsSignalScore', 'painSignalScore', 'hiringSignalScore'],
  },
  fn: (i) => computeUrgencyComposite(i),
});
