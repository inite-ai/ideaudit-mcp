import { computeFundingMomentum } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  hitsByTier: z.object({
    tier_1: z.number().int().min(0).default(0),
    presswire: z.number().int().min(0).default(0),
    regional: z.number().int().min(0).default(0),
    vertical: z.number().int().min(0).default(0),
  }),
  recent30dHits: z.number().int().min(0).default(0),
});
import { defineSpec } from '../types.js';

export const computeFundingMomentumSpec = defineSpec({
  name: 'compute_funding_momentum',
  description:
    'Compute funding_momentum_score (0-10) + badge (HOT/WARM/COOL/COLD) from tier-weighted funding-article hit counts.',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      hitsByTier: {
        type: 'object',
        properties: {
          tier_1: { type: 'integer', minimum: 0 },
          presswire: { type: 'integer', minimum: 0 },
          regional: { type: 'integer', minimum: 0 },
          vertical: { type: 'integer', minimum: 0 },
        },
      },
      recent30dHits: { type: 'integer', minimum: 0 },
    },
    required: ['hitsByTier'],
  },
  fn: (i) => computeFundingMomentum(i),
});
