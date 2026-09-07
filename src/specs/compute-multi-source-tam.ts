/**
 * Market size, cross-examined.
 *
 * Every market-size number a founder is handed comes from somewhere with an
 * interest in it being large. This does not fix that — it just refuses to
 * pick one. Give it two or three sources and it extracts the dollar figures,
 * drops the ones that are statistically absurd next to the others, and
 * reports both the median and how far apart the sources actually were.
 *
 * A high agreement score is worth more than a big number, and a wide spread
 * is a finding rather than an inconvenience.
 */
import { extractTamFromTexts, type TamConsensusResult } from '@ideaudit/enrichment-math';
import { z } from 'zod';
import { defineSpec } from '../types.js';

const Input = z.object({
  inputs: z
    .array(
      z.object({
        source: z.string().min(1).max(100),
        text: z.string().min(1).max(20000),
        estimateYear: z.number().int().min(1990).max(2100).optional(),
      }),
    )
    .min(1)
    .max(10),
});

export const computeMultiSourceTamSpec = defineSpec({
  name: 'compute_multi_source_tam',
  description:
    "Multi-source TAM consensus. Pass 2-3 sources of market-size text. Optional `estimateYear` per source — when supplied, the result includes yearRange and a hasStaleData flag (true if the span exceeds 5 years). Outliers are dropped by modified Z-score over the median absolute deviation when n≥4. Returns the extracted dollar amounts + consensus median + an agreement score 0..1, where 1 means every source lands within 20% of the median.",
  schema: Input,
  jsonSchema: {
    type: 'object',
    required: ['inputs'],
    properties: {
      inputs: {
        type: 'array',
        items: {
          type: 'object',
          required: ['source', 'text'],
          properties: {
            source: { type: 'string' },
            text: { type: 'string' },
            estimateYear: {
              type: 'integer',
              minimum: 1990,
              maximum: 2100,
              description: 'Optional: year the estimate was published.',
            },
          },
        },
      },
    },
  },
  fn: (i): TamConsensusResult => extractTamFromTexts(i.inputs),
});
