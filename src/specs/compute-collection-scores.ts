/**
 * Twelve scores for one enriched idea, plus the badges and the death reason.
 *
 * This is what ranks a collection: given the signals already gathered for an
 * idea, it produces the comparable numbers. Pure arithmetic over the input —
 * gathering those signals is the part that costs money, and that part is the
 * hosted server's.
 */
import { computeCollectionScores } from '@ideaudit/enrichment-math';
import { EnrichedDataSchema, type CollectionScores } from '@ideaudit/shared';
import { z } from 'zod';
import { defineSpec } from '../types.js';

const Input = z.object({
  analysisId: z.string().min(1),
  enrichedData: EnrichedDataSchema,
});

export const computeCollectionScoresSpec = defineSpec({
  name: 'compute_collection_scores',
  description:
    'Compute 12 deterministic collection scores (0-100) + badges + death reason for an enriched idea. Pure math. No external calls.',
  schema: Input,
  jsonSchema: {
    type: 'object',
    required: ['analysisId', 'enrichedData'],
    properties: {
      analysisId: { type: 'string' },
      enrichedData: {
        type: 'object',
        description: 'EnrichedData with canonical_idea signals.',
      },
    },
  },
  fn: (i): CollectionScores => computeCollectionScores(i.analysisId, i.enrichedData),
});
