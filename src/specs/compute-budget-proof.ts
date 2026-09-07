import { computeBudgetProof } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  pricingHitsCount: z.number().int().min(0),
  reviewSiteHitsCount: z.number().int().min(0).default(0),
  purchaseIntentMentions: z.number().int().min(0).default(0),
  hasNamedPricing: z.boolean().default(false),
});
import { defineSpec } from '../types.js';

export const computeBudgetProofSpec = defineSpec({
  name: 'compute_budget_proof',
  description:
    'Compute budget_proof_score (0-10) + label (STRONG/CONFIRMED/WEAK/ABSENT) + purchase_intent_pct from pricing hits + review-site hits + intent mentions.',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      pricingHitsCount: { type: 'integer', minimum: 0 },
      reviewSiteHitsCount: { type: 'integer', minimum: 0 },
      purchaseIntentMentions: { type: 'integer', minimum: 0 },
      hasNamedPricing: { type: 'boolean' },
    },
    required: ['pricingHitsCount'],
  },
  fn: (i) => computeBudgetProof(i),
});
