import { computeHiringDemand } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  sites: z
    .array(
      z.object({
        domain: z.string().min(1),
        hits: z.number().int().min(0),
        priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      }),
    )
    .max(30),
});
import { defineSpec } from '../types.js';

export const computeHiringDemandSpec = defineSpec({
  name: 'compute_hiring_demand',
  description:
    'Compute hiring_demand_score (0-10) from priority-weighted ATS site hit counts (use registries/hiring-sources for priorities).',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      sites: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            domain: { type: 'string' },
            hits: { type: 'integer', minimum: 0 },
            priority: { type: 'integer', enum: [1, 2, 3] },
          },
          required: ['domain', 'hits', 'priority'],
        },
      },
    },
    required: ['sites'],
  },
  fn: (i) => computeHiringDemand(i),
});
