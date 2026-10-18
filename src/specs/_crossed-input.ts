/**
 * The input shared by `compute_dealbreakers_v2` and `compute_crossed_matrix`.
 *
 * The two tools take exactly the same arguments and differ only in what they
 * return and, on the hosted server, in whether they write anything down. They
 * were written twice on the platform and drifted apart in small ways; here
 * they are one declaration, so a new field cannot land in one and miss the
 * other.
 */
import { ObserverProfileSchema } from '@ideaudit/shared';
import { z } from 'zod';

export const LensKeyEnum = z.enum([
  'team',
  'problem_solution',
  'traction',
  'competition',
  'gtm',
  'finance',
]);

export const StageEnum = z.enum(['idea', 'mvp', 'seed', 'series_a_plus']);

/**
 * Everything both tools accept. The hosted `compute_dealbreakers_v2` extends
 * this object with `auditId`; nothing else about the input differs.
 */
export const crossedInputSchema = z.object({
  stage: StageEnum,
  /**
   * Optional per-stage probabilities. When provided, the math blends
   * STAGE_WEIGHTS by these probabilities (the sum is normalised internally),
   * which is how an idea that is half-way to an MVP gets weights that are
   * also half-way rather than snapped to one bucket.
   */
  stageProbabilities: z
    .object({
      idea: z.number().min(0).max(1).optional(),
      mvp: z.number().min(0).max(1).optional(),
      seed: z.number().min(0).max(1).optional(),
      series_a_plus: z.number().min(0).max(1).optional(),
    })
    .optional(),
  sector: z.string().min(1).max(80).optional(),
  lensScores: z
    .array(
      z.object({
        lens: LensKeyEnum,
        score: z.number().min(0).max(100),
        confidence: z.number().min(0).max(1),
        redFlag: z.boolean().default(false),
      }),
    )
    .min(1)
    .max(20),
  unresolvedContradictions: z.number().int().min(0).max(20).default(0),
  hasMajorContradiction: z.boolean().default(false),
  /**
   * Founder profile. When supplied, the math additionally produces an
   * observer-relative verdict — perturbed weights and risk-tolerance shifted
   * thresholds — alongside the substrate one. The KILL gate is deliberately
   * observer-invariant: fatal stays fatal for everyone.
   */
  observer: ObserverProfileSchema.optional(),
});

export type CrossedInput = z.infer<typeof crossedInputSchema>;

/** Hand-written JSON Schema for the same shape. This repository does not derive them. */
export const crossedJsonProperties: Record<string, unknown> = {
  stage: { type: 'string', enum: ['idea', 'mvp', 'seed', 'series_a_plus'] },
  sector: { type: 'string' },
  lensScores: {
    type: 'array',
    items: {
      type: 'object',
      required: ['lens', 'score', 'confidence'],
      properties: {
        lens: {
          type: 'string',
          enum: ['team', 'problem_solution', 'traction', 'competition', 'gtm', 'finance'],
        },
        score: { type: 'number', minimum: 0, maximum: 100 },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        redFlag: { type: 'boolean' },
      },
    },
  },
  stageProbabilities: {
    type: 'object',
    properties: {
      idea: { type: 'number', minimum: 0, maximum: 1 },
      mvp: { type: 'number', minimum: 0, maximum: 1 },
      seed: { type: 'number', minimum: 0, maximum: 1 },
      series_a_plus: { type: 'number', minimum: 0, maximum: 1 },
    },
  },
  unresolvedContradictions: { type: 'integer', minimum: 0, default: 0 },
  hasMajorContradiction: { type: 'boolean', default: false },
  observer: {
    type: 'object',
    description:
      'Founder profile that crosses with the substrate idea to produce an observer-relative verdict. When omitted, only the substrate verdict is returned.',
    required: ['founder_type'],
    properties: {
      founder_type: {
        type: 'string',
        enum: ['solo', 'cofounded_technical', 'cofounded_business', 'domain_expert', 'serial'],
      },
      runway_months: { type: 'integer', minimum: 0, maximum: 60 },
      capital_usd_band: { type: 'string', enum: ['under_50k', '50k_500k', '500k_5m', 'over_5m'] },
      risk_tolerance: { type: 'string', enum: ['conservative', 'moderate', 'aggressive'] },
      expertise_sectors: {
        type: 'array',
        maxItems: 8,
        items: { type: 'string', minLength: 2, maxLength: 80 },
      },
      time_horizon_years: { type: 'integer', minimum: 1, maximum: 15 },
      exit_goal: { type: 'string', enum: ['lifestyle', 'acquisition', 'ipo', 'unicorn'] },
    },
  },
};
