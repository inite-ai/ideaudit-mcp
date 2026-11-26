import { computeSearchVelocityV2 } from '@ideaudit/enrichment-math';
import { z } from 'zod';

const Input = z.object({
  trendsTimelineValues: z.array(z.number().min(0).max(100)).max(120),
  externalVolumeNorm: z.number().min(0).max(1),
  intentNorm: z.number().min(0).max(1),
  geoSpreadNorm: z.number().min(0).max(1),
  daysSinceLastSignal: z.number().min(0).optional(),
});
import { defineSpec } from '../types.js';

export const computeSearchVelocityV2Spec = defineSpec({
  name: 'compute_search_velocity_v2',
  description:
    'Search velocity (0-25) v2 — canonical 0.40*volume + 0.30*trend + 0.20*intent + 0.10*geo. CRITICAL: externalVolumeNorm MUST come from external sources (Amazon BSR / app store installs / job-board postings) — NOT the Trends timeline (would double-count, since Trends is itself normalized 0-100 within window). trendNorm is derived internally from trendsTimelineValues. Trends peak<50 zeroes the trend component (Yotpo SEO floor). Optional daysSinceLastSignal applies exponential freshness decay (search half-life 90d).',
  schema: Input,
  jsonSchema: {
    type: 'object',
    properties: {
      trendsTimelineValues: {
        type: 'array',
        items: { type: 'number', minimum: 0, maximum: 100 },
        description: 'Monthly Trends values 0-100. Used ONLY to derive trendNorm — never as raw volume.',
      },
      externalVolumeNorm: {
        type: 'number', minimum: 0, maximum: 1,
        description: 'Normalized 0-1 demand volume from EXTERNAL sources (Amazon, app stores, jobs). Caller normalizes before passing.',
      },
      intentNorm: { type: 'number', minimum: 0, maximum: 1, description: '0-1 commercial/transactional intent ratio.' },
      geoSpreadNorm: { type: 'number', minimum: 0, maximum: 1, description: '0-1 geographic spread (regions with interest > threshold).' },
      daysSinceLastSignal: {
        type: 'number', minimum: 0,
        description: 'Optional: days since most recent confirming signal. Triggers exponential freshness decay (half-life 90d).',
      },
    },
    required: ['trendsTimelineValues', 'externalVolumeNorm', 'intentNorm', 'geoSpreadNorm'],
  },
  fn: (i) => computeSearchVelocityV2(i),
});
