import { computeMonetization } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  pricingAnchorsCount: z.number().int().min(0),
  modelTags: z.array(z.string()).default([]),
  dealCycle: z.string().default(''),
});
import { defineSpec } from '../types.js';

export const computeMonetizationSpec = defineSpec({
  name: 'compute_monetization',
  description:
    'Compute monetization_score (0-21) + label + has_pricing_anchors from pricing anchors + model tags + deal cycle hint.',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      pricingAnchorsCount: { type: 'integer', minimum: 0 },
      modelTags: {
        type: 'array',
        items: { type: 'string' },
        description: 'e.g. ["subscription","usage","marketplace"]',
      },
      dealCycle: { type: 'string', description: 'instant/days/weeks/months/quarters' },
    },
    required: ['pricingAnchorsCount'],
  },
  fn: (i) => computeMonetization(i),
});
