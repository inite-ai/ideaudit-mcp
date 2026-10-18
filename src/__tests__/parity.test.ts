import { describe, expect, it } from 'vitest';
import { ALL_SPECS } from '../registry.js';
import {
  computeBarrierSpec,
  computeCrossedMatrixSpec,
  computeDealbreakersV2Spec,
  computeMultiSourceTamSpec,
} from '../index.js';
import { unknownArgs } from '../server.js';

/**
 * The promise this package makes is not "here is some scoring code" — it is
 * "this returns the same number the hosted platform returns". These tests pin
 * the structural facts that make that true, so a future change has to break a
 * test rather than break the promise quietly.
 */

describe('the registry is the whole surface', () => {
  it('holds every spec exactly once', () => {
    const names = ALL_SPECS.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names.length).toBeGreaterThan(0);
  });

  it('gives every tool a schema, a json schema and a function', () => {
    for (const s of ALL_SPECS) {
      expect(s.name, s.name).toMatch(/^[a-z][a-z0-9_]*$/);
      expect(s.description.length, s.name).toBeGreaterThan(20);
      expect(typeof s.schema.safeParse, s.name).toBe('function');
      expect(s.jsonSchema, s.name).toHaveProperty('type');
      expect(typeof s.fn, s.name).toBe('function');
    }
  });

  it('is the same object the platform imports, not a copy', () => {
    // Identity, not deep equality. If these ever became two objects, the
    // local and hosted answers could drift and nothing would notice.
    expect(ALL_SPECS).toContain(computeBarrierSpec);
    expect(ALL_SPECS).toContain(computeDealbreakersV2Spec);
  });

  it('serves the verdict, not only the inputs to it', () => {
    // The point of publishing is that the number which decides go / no-go is
    // readable. A registry that scored the parts but withheld the conclusion
    // would be the same withholding in a friendlier shape.
    expect(ALL_SPECS.map((s) => s.name)).toContain('compute_dealbreakers_v2');
  });
});

describe('the tools are deterministic', () => {
  it('returns the same answer for the same input, twice', () => {
    const input = { directCompetitorCount: 12, adjacentCompetitorCount: 30, serpNoise: 0.4 };
    const a = computeBarrierSpec.fn(input);
    const b = computeBarrierSpec.fn(input);
    expect(a).toEqual(b);
    expect(a).toEqual({ score: 8.4, label: 'COMPETITIVE' });
  });

  it('validates before computing, so a bad input is refused not guessed', () => {
    const bad = computeBarrierSpec.schema.safeParse({ directCompetitorCount: -1 });
    expect(bad.success).toBe(false);
  });

  it('applies the schema defaults the hosted server applies', () => {
    // The optional fields have defaults. If the local server skipped them it
    // would answer a different number for the same call.
    const parsed = computeBarrierSpec.schema.safeParse({ directCompetitorCount: 3 });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toMatchObject({ adjacentCompetitorCount: 0, serpNoise: 0 });
    }
  });
});

/** A weak idea: two red-flagged lenses, low scores, low confidence. */
const WEAK = {
  stage: 'idea' as const,
  lensScores: [
    { lens: 'team' as const, score: 30, confidence: 0.4, redFlag: true },
    { lens: 'problem_solution' as const, score: 25, confidence: 0.3, redFlag: true },
    { lens: 'competition' as const, score: 20, confidence: 0.5, redFlag: false },
  ],
  unresolvedContradictions: 0,
  hasMajorContradiction: false,
};

describe('the verdict', () => {
  it('says no to a weak idea, and says why in numbers', () => {
    const v = computeDealbreakersV2Spec.fn(WEAK);
    expect(v.verdict).toBe('KILL');
    expect(v.score).toBeLessThan(50);
    expect(v.redFlagCounts.blocker).toBeGreaterThanOrEqual(2);
  });

  it('keeps the kill gate observer-invariant — fatal stays fatal', () => {
    // The description of this tool claims it. A founder profile shifts the
    // thresholds for everything above the gate; it must not talk an idea out
    // of a KILL, or the observer becomes a way to buy a better answer.
    for (const founder_type of [
      'solo',
      'cofounded_technical',
      'cofounded_business',
      'domain_expert',
      'serial',
    ] as const) {
      const v = computeDealbreakersV2Spec.fn({
        ...WEAK,
        observer: { founder_type, risk_tolerance: 'aggressive' },
      });
      expect(v.crossed?.verdict ?? v.verdict, founder_type).toBe('KILL');
    }
  });

  it('produces the archetype matrix even when nobody named a founder', () => {
    const v = computeDealbreakersV2Spec.fn(WEAK);
    expect(v.crossed).toBeNull();
    expect(v.archetypes).toHaveLength(5);
  });

  it('agrees with compute_crossed_matrix, which computes it the same way', () => {
    const flat = computeDealbreakersV2Spec.fn(WEAK);
    const raw = computeCrossedMatrixSpec.fn(WEAK);
    expect(flat.score).toBe(raw.substrateFull.score);
    expect(flat.archetypes).toEqual(raw.archetypes);
  });
});

describe('multi-source TAM', () => {
  it('reports disagreement rather than averaging it away', () => {
    const wide = computeMultiSourceTamSpec.fn({
      inputs: [
        { source: 'a', text: '$1B market' },
        { source: 'b', text: '$40B market' },
      ],
    });
    const tight = computeMultiSourceTamSpec.fn({
      inputs: [
        { source: 'a', text: '$38B market' },
        { source: 'b', text: '$40B market' },
      ],
    });
    expect(wide.consensusUsd).toBe(40e9);
    expect(tight.consensusUsd).toBe(40e9);
    // Same median, very different confidence in it. Reporting only the median
    // would make these two look like the same finding.
    expect(wide.agreementScore).toBeLessThan(tight.agreementScore);
    expect(wide.note).toMatch(/disagree/i);
    expect(tight.note).toMatch(/agree/i);
  });
});

describe('the boundary is stated, not silently applied', () => {
  it('refuses an argument only the hosted server can honour', () => {
    // Zod strips an unknown key without complaint. A caller that passed
    // auditId would get a correct verdict and believe it had been saved.
    expect(unknownArgs(computeDealbreakersV2Spec, { ...WEAK, auditId: 'x' })).toEqual(['auditId']);
    expect(unknownArgs(computeDealbreakersV2Spec, WEAK)).toEqual([]);
  });
});
