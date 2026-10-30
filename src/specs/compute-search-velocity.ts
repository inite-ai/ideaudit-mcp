import { computeSearchVelocity } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  timelineValues: z.array(z.number().min(0).max(100)).max(120),
  risingQueriesCount: z.number().int().min(0).default(0),
  geoRegionCount: z.number().int().min(0).default(0),
});
import { defineSpec } from '../types.js';

export const computeSearchVelocitySpec = defineSpec({
  name: 'compute_search_velocity',
  description:
    'Compute search_velocity_score (0-25) from Trends timeline values + rising queries count + geo region count.',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      timelineValues: {
        type: 'array',
        items: { type: 'number', minimum: 0, maximum: 100 },
        description: 'Monthly Trends values 0-100 (e.g. last 10-12 months).',
      },
      risingQueriesCount: { type: 'integer', minimum: 0 },
      geoRegionCount: { type: 'integer', minimum: 0 },
    },
    required: ['timelineValues'],
  },
  fn: (i) => computeSearchVelocity(i),
});
