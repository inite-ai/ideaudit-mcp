import { computeLrsCompositeV2 } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  searchVelocityScore: z.number().min(0).max(25),
  socialPainScore: z.number().min(0).max(30),
  barrierScore: z.number().min(0).max(24),
  monetizationScore: z.number().min(0).max(21),
  xSignalScore: z.number().min(0).max(20),
  budgetProofScore: z.number().min(0).max(10),
  buildComplexityPenalty: z.number().min(0).max(10).optional(),
  sectorProfile: z.enum(['default', 'ai_native', 'creator', 'crypto']).optional(),
});
import { defineSpec } from '../types.js';

export const computeLrsCompositeV2Spec = defineSpec({
  name: 'compute_lrs_composite_v2',
  description:
    'LRS composite v2 — 6 components (SV, Pain, Barrier, Monet, X-Signal, Budget-Proof). Default Python weights 0.18/0.22/0.18/0.14/0.18/0.10 sum=1.0. Returns BOTH weighted score and equal-weight baseline (per OECD Handbook + Greco 2018 — equal-weight is defensible default when no outcome calibration exists). buildComplexityPenalty 0-10 subtracted from score. sectorProfile (ai_native/creator/crypto) opt-in reshuffles SV→0.16, X→0.20. Labels: THE_ROAR (≥80) / PROMISING (≥60) / EXPERIMENTAL (≥40) / WEAK_SIGNAL (<40).',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      searchVelocityScore: { type: 'number', minimum: 0, maximum: 25 },
      socialPainScore: { type: 'number', minimum: 0, maximum: 30 },
      barrierScore: { type: 'number', minimum: 0, maximum: 24 },
      monetizationScore: { type: 'number', minimum: 0, maximum: 21 },
      xSignalScore: { type: 'number', minimum: 0, maximum: 20 },
      budgetProofScore: { type: 'number', minimum: 0, maximum: 10 },
      buildComplexityPenalty: { type: 'number', minimum: 0, maximum: 10 },
      sectorProfile: {
        type: 'string',
        enum: ['default', 'ai_native', 'creator', 'crypto'],
        description: 'Opt-in sector weight override. Default uses Python canonical weights.',
      },
    },
    required: [
      'searchVelocityScore', 'socialPainScore', 'barrierScore',
      'monetizationScore', 'xSignalScore', 'budgetProofScore',
    ],
  },
  fn: (i) => computeLrsCompositeV2(i),
});
