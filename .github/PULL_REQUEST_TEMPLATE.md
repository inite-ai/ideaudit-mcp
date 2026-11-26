<!--
  Read first: this repository is a mirror of a private monorepo and is force-pushed on
  every sync, so a PR merged here is overwritten by the next one. For a change to a tool,
  a threshold or the server, please open an issue with the exact input instead
  (templates: Product idea, Bug report) — see AGENTS.md.
-->

## What this changes, in plain words

<!-- Two or three sentences a non-engineer can follow. -->

## Why a PR here, not an issue

- [ ] a maintainer asked for this change to the mirror's own docs/tooling, and the same change is in the monorepo's `packages/audit-tools/mirror/` (link):

## Zone

<!-- See "Zones" in AGENTS.md. Everything under src/, dist/, bin/, package.json and server.json is changed in the monorepo, not here. -->
- [ ] yellow — docs/tooling only

## Gates

- [ ] `npm install --no-package-lock`
- [ ] `node --check bin/mcp.js`
- [ ] `node scripts/verify-dist.mjs`
- [ ] `npm pack --dry-run`
- [ ] CI green on this PR

## AI-assisted

<!-- Disclosure, not judgement. -->
- [ ] no
- [ ] yes — agent:
