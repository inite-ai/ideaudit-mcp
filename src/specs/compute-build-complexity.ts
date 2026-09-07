import { computeBuildComplexity } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  externalApisCount: z.number().int().min(0),
  stackComplexityTags: z.array(z.string()).default([]),
  integrationsCount: z.number().int().min(0).default(0),
});
import { defineSpec } from '../types.js';

export const computeBuildComplexitySpec = defineSpec({
  name: 'compute_build_complexity',
  description:
    'Compute build_complexity_penalty (0-10, higher = worse) + per-factor breakdown. Hard tags: ml/realtime/blockchain/hardware/compliance/custom-ai/regulated/on-device-ai/iot.',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      externalApisCount: { type: 'integer', minimum: 0 },
      stackComplexityTags: { type: 'array', items: { type: 'string' } },
      integrationsCount: { type: 'integer', minimum: 0 },
    },
    required: ['externalApisCount'],
  },
  fn: (i) => computeBuildComplexity(i),
});
