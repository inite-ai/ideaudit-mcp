/**
 * Every deterministic tool this package serves.
 *
 * The hosted platform imports the same specs one by one and wraps each with
 * quota and metering. This list is what the local server offers, and the two
 * cannot disagree about a tool's name, schema or arithmetic — there is only
 * one of each.
 */
import type { AnyToolSpec } from './types.js';
import { computeBarrierSpec } from './specs/compute-barrier.js';
import { computeBudgetProofSpec } from './specs/compute-budget-proof.js';
import { computeBuildComplexitySpec } from './specs/compute-build-complexity.js';
import { computeCollectionScoresSpec } from './specs/compute-collection-scores.js';
import { computeCrossedMatrixSpec } from './specs/compute-crossed-matrix.js';
import { computeDealbreakersV2Spec } from './specs/compute-dealbreakers-v2.js';
import { computeFundingMomentumSpec } from './specs/compute-funding-momentum.js';
import { computeHiringDemandSpec } from './specs/compute-hiring-demand.js';
import { computeLrsCompositeV2Spec } from './specs/compute-lrs-composite-v2.js';
import { computeLrsCompositeSpec } from './specs/compute-lrs-composite.js';
import { computeMonetizationSpec } from './specs/compute-monetization.js';
import { computeMultiSourceTamSpec } from './specs/compute-multi-source-tam.js';
import { computePpcSpendSpec } from './specs/compute-ppc-spend.js';
import { computeSearchVelocityV2Spec } from './specs/compute-search-velocity-v2.js';
import { computeSearchVelocitySpec } from './specs/compute-search-velocity.js';
import { computeSocialPainSpec } from './specs/compute-social-pain.js';
import { computeUrgencyCompositeSpec } from './specs/compute-urgency-composite.js';
import { computeXSignalSpec } from './specs/compute-x-signal.js';
import { deriveKillCriteriaSpec } from './specs/derive-kill-criteria.js';
import { validateUnitEconomicsSpec } from './specs/validate-unit-economics.js';

export const ALL_SPECS: AnyToolSpec[] = [
  computeBarrierSpec,
  computeBudgetProofSpec,
  computeBuildComplexitySpec,
  computeCollectionScoresSpec,
  computeCrossedMatrixSpec,
  computeDealbreakersV2Spec,
  computeFundingMomentumSpec,
  computeHiringDemandSpec,
  computeLrsCompositeV2Spec,
  computeLrsCompositeSpec,
  computeMonetizationSpec,
  computeMultiSourceTamSpec,
  computePpcSpendSpec,
  computeSearchVelocityV2Spec,
  computeSearchVelocitySpec,
  computeSocialPainSpec,
  computeUrgencyCompositeSpec,
  computeXSignalSpec,
  deriveKillCriteriaSpec,
  validateUnitEconomicsSpec,
];
