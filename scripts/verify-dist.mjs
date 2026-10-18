#!/usr/bin/env node
/**
 * Does the committed dist/bundle.js still serve what src/ says it serves?
 *
 * This repository is a mirror. `src/` cannot be compiled here — the specs
 * import `@ideaudit/enrichment-math` and `@ideaudit/shared`, which live only
 * in the private monorepo — so `dist/bundle.js` is committed, built upstream,
 * and is what `bin/mcp.js` runs for `npx @inite/ideaudit-tools` and for
 * `npx github:inite-ai/ideaudit-mcp`. A rebuild is impossible here; a
 * comparison is not. This boots the bundle the way a client does and checks
 * it against the source and the manifests at the level a client can see:
 *
 *   - the served tool names are exactly the `name:` of every src/specs file;
 *   - where a spec writes its `required` list and description as literals,
 *     the served schema and description match them;
 *   - package.json and server.json agree (mcpName, identifier, version) —
 *     the same constraints src/__tests__/registry-manifest.test.ts asserts
 *     upstream, where vitest can run;
 *   - the verdict the README promises still comes out (three weak lenses with
 *     red flags → KILL), and storage arguments are refused, not stripped.
 *
 * Usage: node scripts/verify-dist.mjs   (after `npm install`)
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (p) => readFileSync(path.join(root, p), 'utf8');
const failures = [];
const fail = (msg) => failures.push(msg);

// ── What the source declares ────────────────────────────────────────────────
const specDir = path.join(root, 'src', 'specs');
const declared = new Map();
for (const file of readdirSync(specDir).filter((f) => f.endsWith('.ts'))) {
  const text = readFileSync(path.join(specDir, file), 'utf8');
  const name = text.match(/^\s+name: '([a-z0-9_]+)'/m)?.[1];
  if (!name) continue; // shared helpers such as _crossed-input.ts
  // Top level only: the spec object sits at two spaces, its jsonSchema keys at
  // four. A nested `required` (an array item's) is deeper and is skipped.
  const afterSchema = text.slice(text.indexOf('jsonSchema:'));
  const required = afterSchema.match(/^ {4}required: \[([^\]]*)\]/m)?.[1];
  const quoted = text.match(/^ {2}description:\s*(['"])((?:(?!\1)[^\\]|\\.)*)\1,$/m);
  const description = quoted ? quoted[2].replace(/\\(['"])/g, '$1') : null;
  declared.set(name, {
    file,
    required:
      required === undefined
        ? null
        : [...required.matchAll(/'([^']+)'/g)].map((m) => m[1]).sort(),
    description,
  });
}

// ── What the manifests say ──────────────────────────────────────────────────
const pkg = JSON.parse(read('package.json'));
const server = JSON.parse(read('server.json'));
if (pkg.mcpName !== server.name) fail(`package.json mcpName ${pkg.mcpName} ≠ server.json name ${server.name}`);
for (const p of server.packages ?? []) {
  if (p.registryType === 'npm' && p.identifier !== pkg.name) fail(`server.json identifier ${p.identifier} ≠ ${pkg.name}`);
  if (p.version !== pkg.version) fail(`server.json packages[].version ${p.version} ≠ package.json ${pkg.version}`);
}
if ((server.description ?? '').length > 100) fail('server.json description is over the registry limit of 100 characters');

// ── What the bundle serves ──────────────────────────────────────────────────
const client = new Client({ name: 'verify-dist', version: '0' }, { capabilities: {} });
await client.connect(
  new StdioClientTransport({ command: process.execPath, args: [path.join(root, 'bin', 'mcp.js')] }),
);
const { tools } = await client.listTools();
const served = new Map(tools.map((t) => [t.name, t]));

for (const name of declared.keys()) if (!served.has(name)) fail(`src declares ${name}, the bundle does not serve it`);
for (const name of served.keys()) if (!declared.has(name)) fail(`the bundle serves ${name}, no src/specs file declares it`);

let requiredChecked = 0;
let descriptionsChecked = 0;
for (const [name, spec] of declared) {
  const tool = served.get(name);
  if (!tool) continue;
  if (spec.required) {
    requiredChecked++;
    const got = [...(tool.inputSchema?.required ?? [])].sort();
    if (JSON.stringify(got) !== JSON.stringify(spec.required)) {
      fail(`${name}: required ${JSON.stringify(got)} in the bundle, ${JSON.stringify(spec.required)} in src/specs/${spec.file}`);
    }
  }
  if (spec.description) {
    descriptionsChecked++;
    if (tool.description !== spec.description) fail(`${name}: description differs between the bundle and src/specs/${spec.file}`);
  }
}

if (/twenty/i.test(server.description ?? '') && tools.length !== 20) {
  fail(`server.json says twenty tools; the bundle serves ${tools.length}`);
}

const kill = await client.callTool({
  name: 'compute_dealbreakers_v2',
  arguments: {
    stage: 'idea',
    lensScores: [
      { lens: 'team', score: 30, confidence: 0.4, redFlag: true },
      { lens: 'problem_solution', score: 25, confidence: 0.3, redFlag: true },
      { lens: 'competition', score: 20, confidence: 0.5, redFlag: false },
    ],
  },
});
const verdict = JSON.parse(kill.content[0].text).verdict;
if (verdict !== 'KILL') fail(`compute_dealbreakers_v2 on three weak, red-flagged lenses returned ${verdict}, not KILL`);

const refused = await client.callTool({
  name: 'compute_barrier',
  arguments: { directCompetitorCount: 1, auditId: 'x' },
});
if (!refused.isError || !/unknown_arguments/.test(refused.content[0].text)) {
  fail('an auditId argument was accepted instead of refused as unknown_arguments');
}

await client.close();

if (failures.length) {
  console.error(`dist/ is out of step with src/ or the manifests:\n  - ${failures.join('\n  - ')}`);
  console.error('dist/ is built in the private monorepo (packages/audit-tools) and synced here; it cannot be rebuilt in this repo.');
  process.exit(1);
}
console.log(
  `ok — ${tools.length} tools served = ${declared.size} declared in src/specs; ` +
    `required lists checked for ${requiredChecked}, descriptions for ${descriptionsChecked}; ` +
    `manifests agree at ${pkg.name}@${pkg.version}; KILL gate holds; storage arguments refused`,
);
