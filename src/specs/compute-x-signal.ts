import { computeXSignal } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  mentionsCount: z.number().int().min(0),
  recent7dCount: z.number().int().min(0).default(0),
  sentimentPositive: z.number().int().min(0).default(0),
  sentimentNegative: z.number().int().min(0).default(0),
  founderMentions: z.number().int().min(0).default(0),
});
import { defineSpec } from '../types.js';

export const computeXSignalSpec = defineSpec({
  name: 'compute_x_signal',
  description:
    'Compute x_signal_score (0-20) + recency share + positivity rate from X/Twitter mention counts.',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      mentionsCount: { type: 'integer', minimum: 0 },
      recent7dCount: { type: 'integer', minimum: 0 },
      sentimentPositive: { type: 'integer', minimum: 0 },
      sentimentNegative: { type: 'integer', minimum: 0 },
      founderMentions: { type: 'integer', minimum: 0 },
    },
    required: ['mentionsCount'],
  },
  fn: (i) => computeXSignal(i),
});
