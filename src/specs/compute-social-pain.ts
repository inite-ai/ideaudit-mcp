import { computeSocialPain } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  painMentions: z.number().int().min(0),
  intentMentions: z.number().int().min(0).default(0),
  urgencyMentions: z.number().int().min(0).default(0),
  categoryCounts: z
    .object({
      business: z.number().int().min(0).default(0),
      consumer: z.number().int().min(0).default(0),
      trend: z.number().int().min(0).default(0),
    })
    .partial()
    .optional(),
});
import { defineSpec } from '../types.js';

export const computeSocialPainSpec = defineSpec({
  name: 'compute_social_pain',
  description:
    'Compute social_pain_score (0-30) + total mentions + dominant perspective (business/consumer/trend/mixed).',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      painMentions: { type: 'integer', minimum: 0 },
      intentMentions: { type: 'integer', minimum: 0, default: 0 },
      urgencyMentions: { type: 'integer', minimum: 0, default: 0 },
      categoryCounts: {
        type: 'object',
        properties: {
          business: { type: 'integer', minimum: 0 },
          consumer: { type: 'integer', minimum: 0 },
          trend: { type: 'integer', minimum: 0 },
        },
      },
    },
    required: ['painMentions'],
  },
  fn: (i) => computeSocialPain(i),
});
