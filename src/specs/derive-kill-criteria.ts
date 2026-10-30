/**
 * The lines you agree to in advance.
 *
 * A kill criterion is only worth writing down if it can be tripped. The prose
 * version — "no clear competitive advantage identified" — cannot: it is true
 * on the day you write it and true forever after, so it never fires and never
 * costs anybody a decision. Every row here is derived from a number that was
 * already computed, and carries the threshold next to it.
 *
 * The hosted server can additionally file these against an audit so a later
 * session can check them. That is storage; the derivation is this function.
 */
import { deriveKillCriteria, type KillCriterion } from '@ideaudit/enrichment-math';
import { z } from 'zod';
import { defineSpec } from '../types.js';

export const killCriteriaInputSchema = z.object({
  unitEcon: z
    .object({
      ok: z.boolean(),
      errors: z.array(
        z.object({
          rule: z.string(),
          severity: z.enum(['block', 'warn']),
          detail: z.string(),
        }),
      ),
      derived: z.object({
        revenueIdentityRatio: z.number().nullable().optional(),
        ltvCacRatio: z.number().nullable().optional(),
        cacPaybackMonths: z.number().nullable().optional(),
      }),
    })
    .optional(),
  dealbreakers: z
    .object({
      score: z.number(),
      rawScore: z.number(),
      avgConfidence: z.number(),
      zone: z.string(),
      verdict: z.string(),
      redFlagCount: z.number(),
      redFlagCounts: z.object({
        blocker: z.number(),
        caution: z.number(),
        nit: z.number(),
      }),
    })
    .passthrough()
    .optional(),
  icpDriftCount: z.number().int().nonnegative().optional(),
});

export const killCriteriaJsonProperties: Record<string, unknown> = {
  unitEcon: { type: 'object', description: 'The result of validate_unit_economics.' },
  dealbreakers: { type: 'object', description: 'The result of compute_dealbreakers_v2.' },
  icpDriftCount: { type: 'integer', minimum: 0 },
};

export const deriveKillCriteriaSpec = defineSpec({
  name: 'derive_kill_criteria',
  description:
    'Derive a falsifiable, data-driven list of kill criteria from upstream signals — the outputs of validate_unit_economics and compute_dealbreakers_v2, plus an ICP drift count. Returns one row per rule with {rule, threshold, status, evidence?}, where status is tripped_now / monitor / cleared. Replaces prose kill criteria, which are tautologies that can never fire.',
  schema: killCriteriaInputSchema,
  jsonSchema: {
    type: 'object',
    required: [],
    properties: killCriteriaJsonProperties,
  },
  fn: (i): { rows: KillCriterion[] } => ({
    rows: deriveKillCriteria({
      unitEcon: i.unitEcon as never,
      dealbreakers: i.dealbreakers as never,
      icpDriftCount: i.icpDriftCount,
    }),
  }),
});
