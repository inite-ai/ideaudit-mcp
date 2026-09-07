/**
 * Wave 5 N.4 — compute_ppc_spend_signal MCP tool.
 *
 * Pure math: takes the aggregate numbers extracted from a `dataforseo_ad_traffic`
 * call (avgCpcUsd, totalMonthlySpendUsd, optional bidder count + competition)
 * and produces a 0-10 score with a STRONG / CONFIRMED / WEAK / ABSENT label.
 *
 * Distinct from compute_budget_proof — that one uses pricing-page hits +
 * review-site hits + intent mentions. This one uses paid-auction money
 * directly. Both can be averaged for a fuller demand picture.
 */
import { computePpcSpendSignal } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  avgCpcUsd: z.number().min(0),
  totalMonthlySpendUsd: z.number().min(0),
  competitorBidders: z.number().int().min(0).optional(),
  competition: z.number().min(0).max(1).optional(),
});
import { defineSpec } from '../types.js';

export const computePpcSpendSpec = defineSpec({
  name: 'compute_ppc_spend_signal',
  description:
    'Wave 5 N.4 — compute ppc_spend_score (0-10) + label (STRONG/CONFIRMED/WEAK/ABSENT) + market_saturation from PPC traffic projection (avgCpcUsd, totalMonthlySpendUsd, optional competitorBidders + competition). Feed numbers from dataforseo_ad_traffic.',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      avgCpcUsd: { type: 'number', minimum: 0 },
      totalMonthlySpendUsd: { type: 'number', minimum: 0 },
      competitorBidders: { type: 'integer', minimum: 0 },
      competition: { type: 'number', minimum: 0, maximum: 1 },
    },
    required: ['avgCpcUsd', 'totalMonthlySpendUsd'],
  },
  fn: (i) => computePpcSpendSignal(i),
});
