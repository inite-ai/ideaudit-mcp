# AGENTS.md — ideaudit-mcp

Instructions for AI coding agents (Claude Code, Cursor, Codex, Copilot coding
agent, Gemini CLI, Windsurf…) working **on** this repository. Humans: the
[README](README.md) says what the package does; [CONTRIBUTING.md](CONTRIBUTING.md)
says how to propose a change.

## What this is — and the one thing to know first

`@inite/ideaudit-tools` — a local stdio MCP server (`ideaudit-tools`) serving
the **twenty deterministic scoring tools** behind [ideaudit](https://inite.studio)
(`compute_dealbreakers_v2`, `compute_barrier`, `validate_unit_economics`, …):
pure functions of their input — no account, no network, no model calls — so
founders and investors can check the arithmetic behind an audit's verdict and
argue with the numbers. The hosted server (`https://api.inite.studio/mcp`)
serves the same twenty under the same names plus persistence and data tools.

**This repository is a mirror, not the source.** It is rebuilt and
force-pushed from the private monorepo `inite-ai/initeaudit`
(`packages/audit-tools`, built with `packages/enrichment-math` and
`packages/shared`) by its `publish-oss-mirror.yml` workflow on every change
there. The sync recreates the tree from scratch and pushes `--force`, so:

- a commit or PR made here is **overwritten by the next sync**, without
  notice (README "Contributing, and a warning about it");
- the right output of work here is an **issue** with a reproducible input —
  every tool is deterministic, so a disagreement about a number is settleable;
- code changes happen in the monorepo, by people with access to it.

## Why `dist/` is committed (the rule)

`bin/mcp.js` — the package's `bin` — imports `../dist/bundle.js`, and
`package.json` `main`/`exports` point at it too. `src/` **cannot be built
here**: the specs import `@ideaudit/enrichment-math` and `@ideaudit/shared`,
which exist only in the monorepo and are not on npm, and the mirror's
`package.json` has no build script or devDependencies. The monorepo inlines
them into `dist/bundle.js` with esbuild and the mirror script copies the
bundle plus four self-contained declaration files (`public`, `registry`,
`server`, `types` `.d.ts`). Committing it is what makes
`npx -y github:inite-ai/ideaudit-mcp` work (git installs run no build) and
keeps the npm tarball identical to this tree.

So: **never delete, rebuild or hand-edit `dist/`.** It changes only through a
sync. To check it is in step with `src/` and the manifests, run
`node scripts/verify-dist.mjs` (CI does). If it fails, the fix is a sync from
the monorepo — open an issue.

## Ground rules (non-negotiable)

1. **Tool names and input schemas are a public contract** — for MCP clients,
   for the MCP Registry entry (`server.json`, `studio.inite/ideaudit-tools`)
   and for the hosted server, which serves the same specs under the same
   names. Never propose renaming or removing a tool or a required input
   without a deprecation path (old name kept, description says "deprecated:
   use …").
2. **Deterministic stays deterministic.** Every tool is a pure, synchronous,
   total function (`src/types.ts`): same input → same output, here and on the
   hosted server. Nothing that needs the network, a database, a key, a clock
   or a model belongs in this package.
3. **The KILL gate is observer-invariant.** A founder profile may shift
   thresholds above the gate, never below it (README; checked in
   `src/__tests__/parity.test.ts`). Don't propose otherwise.
4. **Unknown arguments are refused, not stripped.** `unknownArgs()` in
   `src/server.ts` turns `auditId`/`persist` into `unknown_arguments` so
   nobody believes a verdict was saved. Keep it.
5. **Never log or send user data.** Inputs (an idea's numbers) stay on the
   user's machine; the local server has no network code. Don't paste a
   founder's real figures into an issue — reduce them to a minimal input that
   still reproduces.
6. **stdout is the MCP transport.** Errors go to stderr (`bin/mcp.js`).
7. **Versions move together.** `package.json` `version` (1.0.0) =
   `server.json` `packages[0].version`; `mcpName` = `server.json` `name`;
   the handshake reads the version from `package.json` (no literal in
   `src/server.ts`). `server.json` top-level `version` (1.1.0) is the registry
   entry's own and moves independently. All of it is set in the monorepo.
8. **No PRs that would be lost.** Don't commit work here expecting it to land;
   see "From idea to PR".

## Zones

| Path | What lives there | Zone |
|---|---|---|
| issues | reports, ideas, reproductions | green |
| `README.md`, `AGENTS.md`, `CONTRIBUTING.md`, `CLAUDE.md`, `.claude/`, `.github/`, `.devcontainer/`, `scripts/verify-dist.mjs`, `scripts/call-tool.mjs` | docs and repo tooling | yellow — overwritten by the next sync unless the monorepo's `scripts/mirror.mjs` carries them |
| `src/specs/*.ts` | one tool per file: zod `schema`, hand-written `jsonSchema`, `fn` | red — monorepo only |
| `src/server.ts`, `src/registry.ts`, `src/types.ts`, `src/index.ts`, `src/public.ts` | server, registry, spec shape, exports | red — monorepo only |
| `src/__tests__/*.ts` | vitest: parity, registry manifest | red — monorepo only |
| `dist/` | built bundle + declarations | red — sync only, never by hand |
| `bin/mcp.js`, `package.json`, `server.json` | entry point, npm + registry identity | red — monorepo only |

The maths itself (`computeBarrier` & co.) lives in
`packages/enrichment-math`, which is not mirrored; `dist/bundle.js` is the
readable compiled form.

## Setup

- **Codespaces / devcontainer:** "Code → Codespaces → Create" (or "Reopen in
  Container"). `.devcontainer/devcontainer.json` is a plain Node 20 image;
  `npm install --no-package-lock` runs on create. No services needed.
- **Local:** Node `>=20` (`engines`), then
  `npm install --no-package-lock` (no lockfile is committed and the sync would
  delete one).

## Commands

Exactly what CI runs ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)):

```bash
npm install --no-package-lock --no-audit --no-fund
node --check bin/mcp.js
node scripts/verify-dist.mjs   # boots the bundle, compares it to src/specs + manifests, checks KILL + refusal
npm pack --dry-run             # the tarball carries bin/, dist/bundle.js and the .d.ts files
```

Done = all green. Reproduce a number (the core of any issue here):

```bash
node scripts/call-tool.mjs --list                                   # names, descriptions, input schemas
node scripts/call-tool.mjs compute_barrier '{"directCompetitorCount": 3}'
grep -n "function computeBarrier" -A12 dist/bundle.js               # the constants behind it
```

Run the server: `npm start` (= `node bin/mcp.js`, stdio; a client launches
it). Register it in Claude Code from a checkout:
`claude mcp add ideaudit-tools-local -- node "$PWD/bin/mcp.js"`.

**Not runnable here, by design:** `tsc`, the build, and `src/__tests__`
(vitest + the private workspace packages). They run in the monorepo's
`publish-oss-mirror.yml` (build → test → assemble → "prove it runs" → push)
before every sync.

## Architecture map

```
bin/mcp.js                 entry: imports main() from dist/bundle.js; errors → stderr, exit 1
dist/bundle.js             the whole server + maths, un-minified (built upstream)
src/server.ts              main(): ListTools → ALL_SPECS; CallTool → unknownArgs() refusal
                           → spec.schema.safeParse → spec.fn → JSON text; errors as isError
src/registry.ts            ALL_SPECS: the twenty specs, the only list the server serves
src/types.ts               ToolSpec { name, description, schema (zod), jsonSchema, fn }, defineSpec, indexSpecs
src/specs/<tool>.ts        one tool: zod Input, defineSpec({ name, description, schema, jsonSchema, fn })
src/specs/_crossed-input.ts shared observer-profile input for the crossed tools
src/index.ts / public.ts   exports for the hosted platform / the published typed surface
src/__tests__/             parity.test.ts (identity, KILL gate), registry-manifest.test.ts
server.json                MCP Registry entry: remote (hosted) + npm package (stdio)
```

How a tool is added (in the monorepo, for a maintainer): write
`src/specs/<kebab-name>.ts` with a zod `Input` and a `defineSpec({...})` whose
hand-written `jsonSchema` matches the zod schema and whose `fn` calls a pure
function from `@ideaudit/enrichment-math`; add it to `ALL_SPECS` in
`src/registry.ts` and export it from `src/index.ts`; extend
`src/__tests__/parity.test.ts`; update the README table and the "Twenty"
count in `server.json`/README (a test pins the count); build, test, merge —
the sync publishes it here.

## From idea to PR

For most people — anyone without monorepo access — the loop ends in an
**issue**, not a PR (Claude Code: `/contribute` runs it, `/spec-idea` files
directly):

1. Restate the idea in plain words; ask at most 3 clarifying questions.
2. Check for an existing issue:
   `gh issue list -R inite-ai/ideaudit-mcp --search "<words>" --state all`.
3. **Reproduce locally.** `node scripts/call-tool.mjs <tool> '<json>'` with the
   input in question, and find the constant in `dist/bundle.js` (Commands). A disagreement is "input X gives Y; I expected Z
   because …" — that is the whole report.
4. Write a short spec: problem, tool(s), the input, actual vs expected output,
   the threshold/constant you think is wrong (quote it from
   `dist/bundle.js`), who it affects, risks (does it move a verdict? the KILL
   gate?), out of scope.
5. File it with the "Product idea" or "Bug report" template.
6. A maintainer takes it into `inite-ai/initeaudit`; the fix arrives here by
   sync.

Maintainers with monorepo access: make the change in
`inite-ai/initeaudit` (`packages/audit-tools`, `packages/enrichment-math`),
following that repo's conventions, with conventional commits
(`feat(audit-tools): …`); its CI builds, tests and syncs. Changes to this
repo's docs/tooling (yellow zone) are kept only if `scripts/mirror.mjs` there
copies them.

## Conventions (as seen in `src/`)

- TypeScript strict, ESM, `.js` suffix on relative imports, single quotes,
  semicolons, trailing commas, 2-space indent.
- One tool per file in `src/specs/`, named after the tool in kebab case
  (`compute_dealbreakers_v2` → `compute-dealbreakers-v2.ts`; one shortens it:
  `compute_ppc_spend_signal` → `compute-ppc-spend.ts`), exporting
  `<camelName>Spec`.
- `jsonSchema` is hand-written next to the zod schema (not generated) — the
  two must agree, because clients are shown `jsonSchema` and validated by zod.
- Block comments explain **why** (the failure prevented). Errors are returned
  as `isError` JSON (`invalid_input`, `unknown_arguments`, `tool_failed`),
  verbatim, never paraphrased.

## Testing

Upstream: vitest in `src/__tests__/` — `parity.test.ts` (registry is the whole
surface; specs are the same objects the platform imports; KILL gate
observer-invariant), `registry-manifest.test.ts` (server.json limits,
package/manifest agreement). They need the monorepo to run.

Here: `node scripts/verify-dist.mjs` is the in-repo check — served tools =
`src/specs` names, `required` lists and literal descriptions match, manifests
agree, the KILL example and the `auditId` refusal hold. CI runs it on Node 20
and 22 with `node --check bin/mcp.js` and `npm pack --dry-run`.

## When to ask a human

- always before committing here (it will be overwritten — see above);
- any change to a tool, a threshold, a verdict rule or the KILL gate;
- `scripts/verify-dist.mjs` fails on `main` (the mirror is out of step);
- the README and `dist/bundle.js` disagree about a number;
- licensing (Apache-2.0) or the hosted server's behaviour.

## Help

Issues: <https://github.com/inite-ai/ideaudit-mcp/issues> (templates: product
idea, bug — bring the exact input). Contributing:
[CONTRIBUTING.md](CONTRIBUTING.md). Security: do **not** open a public issue —
this repo has no `SECURITY.md`; ask a maintainer for a private channel. Claude
Code: `/contribute` runs the loop above; `/spec-idea` only files an idea.
