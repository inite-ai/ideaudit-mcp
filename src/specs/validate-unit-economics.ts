import { validateUnitEconomics } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  customers: z.number(),
  arpu: z.number(),
  annualRevenue: z.number(),
  monthlyChurn: z.number().optional(),
  cac: z.number().optional(),
  ltv: z.number().optional(),
  grossMargin: z.number().optional(),
});
import { defineSpec } from '../types.js';

export const validateUnitEconomicsSpec = defineSpec({
  name: 'validate_unit_economics',
  description:
    'Sanity-check a unit-economics row before publishing it in a business-model slide. ' +
    'Catches the math-drift class of failures (customers × ARPU ≠ revenue), enforces the ' +
    "LTV/CAC ≥ 1.5 floor, the cohort-positivity check, and CAC payback bounds. Returns " +
    "{ok, errors[{rule, severity, detail}], derived{ratios}}. Skills MUST regenerate the row " +
    'when ok=false (block-severity errors); warn-severity errors should be surfaced in the ' +
    'final report but do not gate publication. No LLM calls.',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      customers: { type: 'number' },
      arpu: { type: 'number' },
      annualRevenue: { type: 'number' },
      monthlyChurn: { type: 'number' },
      cac: { type: 'number' },
      ltv: { type: 'number' },
      grossMargin: { type: 'number' },
    },
    required: ['customers', 'arpu', 'annualRevenue'],
  },
  fn: (i) => validateUnitEconomics(i),
});
