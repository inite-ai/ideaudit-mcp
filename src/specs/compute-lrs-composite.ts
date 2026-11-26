import { computeLrsComposite } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  searchVelocityScore: z.number().min(0).max(25),
  socialPainScore: z.number().min(0).max(30),
  barrierScore: z.number().min(0).max(24),
  monetizationScore: z.number().min(0).max(21),
});
import { defineSpec } from '../types.js';

export const computeLrsCompositeSpec = defineSpec({
  name: 'compute_lrs_composite',
  description:
    'Compose lrs_final_100 (0-100) + label (WEAK/EMERGING/GOOD/STRONG/ELITE) + leaderboard_eligible flag + sub-percent breakdown. Weights: sv 0.25, sp 0.30, barrier 0.25, monetization 0.20.',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      searchVelocityScore: { type: 'number', minimum: 0, maximum: 25 },
      socialPainScore: { type: 'number', minimum: 0, maximum: 30 },
      barrierScore: { type: 'number', minimum: 0, maximum: 24 },
      monetizationScore: { type: 'number', minimum: 0, maximum: 21 },
    },
    required: [
      'searchVelocityScore',
      'socialPainScore',
      'barrierScore',
      'monetizationScore',
    ],
  },
  fn: (i) => computeLrsComposite(i),
});
