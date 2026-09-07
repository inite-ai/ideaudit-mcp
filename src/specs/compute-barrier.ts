import { computeBarrier } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  directCompetitorCount: z.number().int().min(0),
  adjacentCompetitorCount: z.number().int().min(0).default(0),
  serpNoise: z.number().min(0).max(1).default(0),
});
import { defineSpec } from '../types.js';

export const computeBarrierSpec = defineSpec({
  name: 'compute_barrier',
  description:
    'Compute barrier_score (0-24) + label (PRISTINE/OPEN/COMPETITIVE/CROWDED) from competitor counts + SERP noise fraction.',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      directCompetitorCount: { type: 'integer', minimum: 0 },
      adjacentCompetitorCount: { type: 'integer', minimum: 0, default: 0 },
      serpNoise: { type: 'number', minimum: 0, maximum: 1, default: 0 },
    },
    required: ['directCompetitorCount'],
  },
  fn: (i) => computeBarrier(i),
});
