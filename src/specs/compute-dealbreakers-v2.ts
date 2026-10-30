/**
 * The verdict.
 *
 * Everything else in this package feeds a number into this one, and this is
 * the tool that decides whether an idea is told yes, not yet, or no. It is
 * open for the same reason the rest is: an audit that claims the right to say
 * no has to be arguable on its arithmetic, and it cannot be arguable while
 * the arithmetic is behind a key.
 *
 * What the hosted server adds around this function is persistence, not
 * judgement: it re-reads the audit's unresolved contradictions from its own
 * tables (a caller cannot talk that penalty down, only the database can raise
 * it), stamps stage and sector on the audit row, and writes the verdict where
 * a dashboard can render it later. The number itself is computed here, by
 * this function, in both places.
 */
import {
  computeCrossedDealbreakersV2,
  type DealbreakersV2CrossedResult,
  type DealbreakersV2Input,
  type DealbreakersV2Result,
} from '@ideaudit/enrichment-math';
import { defineSpec } from '../types.js';
import { crossedInputSchema, crossedJsonProperties, type CrossedInput } from './_crossed-input.js';

/**
 * The substrate result with the crossed-product extension attached. When
 * `observer` is omitted, `crossed` and `delta` are null and `archetypes`
 * still carries the five-row matrix — so the comparison is available even for
 * an audit that never named a founder.
 */
export type DealbreakersV2Verdict = DealbreakersV2Result & {
  substrate: DealbreakersV2CrossedResult['substrate'];
  crossed: DealbreakersV2CrossedResult['crossed'];
  delta: DealbreakersV2CrossedResult['delta'];
  archetypes: DealbreakersV2CrossedResult['archetypes'];
};

/**
 * The computation, before it is flattened into the tool's answer.
 *
 * Exported because the hosted server needs the un-flattened result to store
 * the observer context, and it must not compute it a second time to get it.
 * The crossed pipeline always runs: it short-circuits when no observer is
 * given (crossed = null) but still produces the archetype matrix, so neither
 * call site can take a branch the other did not.
 */
export function computeDealbreakersV2Crossed(i: CrossedInput): DealbreakersV2CrossedResult {
  return computeCrossedDealbreakersV2(i as DealbreakersV2Input, i.observer ?? null, i.sector);
}

/** Flatten the crossed result into what the tool returns. */
export function toDealbreakersV2Verdict(
  crossed: DealbreakersV2CrossedResult,
): DealbreakersV2Verdict {
  return {
    ...crossed.substrateFull,
    substrate: crossed.substrate,
    crossed: crossed.crossed,
    delta: crossed.delta,
    archetypes: crossed.archetypes,
  };
}

export const computeDealbreakersV2Spec = defineSpec({
  name: 'compute_dealbreakers_v2',
  description:
    'Methodology v2 dealbreakers — stage-aware weights + confidence-weighted lens scoring + risk-asymmetric verdict (GO requires score≥80 AND zero red flags AND avg confidence≥0.6). Optional `observer` triggers the crossed-product pipeline: substrate verdict (no-observer baseline) PLUS crossed verdict (observer-perturbed weights, risk-tolerance shifted thresholds) PLUS 5-row archetype matrix. The KILL gate (≥2 blockers / score<50) is observer-invariant — fatal stays fatal.',
  schema: crossedInputSchema,
  jsonSchema: {
    type: 'object',
    required: ['stage', 'lensScores'],
    properties: crossedJsonProperties,
  },
  fn: (i): DealbreakersV2Verdict => toDealbreakersV2Verdict(computeDealbreakersV2Crossed(i)),
});
