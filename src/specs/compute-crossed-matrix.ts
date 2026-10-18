/**
 * The same verdict, asked five times.
 *
 * `compute_dealbreakers_v2` answers "what is this idea worth"; this one
 * answers "worth to whom" — the same lens scores run through five founder
 * archetypes, so a solo founder and a serial one can see that they are not
 * being handed the same number and why. It never persists anything, on either
 * server, which is what makes it safe to call repeatedly while exploring.
 */
import type { DealbreakersV2CrossedResult } from '@ideaudit/enrichment-math';
import { defineSpec } from '../types.js';
import { crossedInputSchema, crossedJsonProperties } from './_crossed-input.js';
import { computeDealbreakersV2Crossed } from './compute-dealbreakers-v2.js';

export const computeCrossedMatrixSpec = defineSpec({
  name: 'compute_crossed_matrix',
  description:
    'Crossed-product audit explorer. Same input as compute_dealbreakers_v2 — returns substrate verdict (no-observer baseline) + crossed verdict (when observer supplied) + a 5-row matrix of {solo, cofounded_technical, cofounded_business, domain_expert, serial} archetype verdicts. Never persists; meant for the dashboard "view as [archetype]" dropdown and for previewing a verdict before committing to it.',
  schema: crossedInputSchema,
  jsonSchema: {
    type: 'object',
    required: ['stage', 'lensScores'],
    properties: crossedJsonProperties,
  },
  fn: (i): DealbreakersV2CrossedResult => computeDealbreakersV2Crossed(i),
});
