import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ALL_SPECS } from '../registry.js';

/**
 * `server.json` is what the MCP registry reads, and the registry is strict in
 * ways that only surface at submission time — after the npm version it names
 * has already been published and can no longer be changed.
 *
 * So the constraints live here instead, as assertions that fail in a second
 * rather than after a one-way door. Every limit below was read off the
 * published schema at 2025-12-11, not guessed.
 */
const root = new URL('../../', import.meta.url);
const read = (p: string): Record<string, unknown> =>
  JSON.parse(readFileSync(fileURLToPath(new URL(p, root)), 'utf8')) as Record<string, unknown>;

const server = read('server.json');
const pkg = read('package.json');

interface RegistryPackage {
  registryType: string;
  identifier: string;
  version?: string;
  transport: { type: string };
}

describe('server.json satisfies the MCP registry schema', () => {
  it('carries the three required fields', () => {
    for (const field of ['name', 'description', 'version']) {
      expect(server[field], field).toBeTruthy();
    }
  });

  it('uses a name the registry will accept', () => {
    expect(server.name).toMatch(/^[a-zA-Z0-9.-]+\/[a-zA-Z0-9._-]+$/);
  });

  it('keeps the description inside 100 characters', () => {
    // The one that would have been rejected: a description written for a
    // README is roughly twice this.
    expect((server.description as string).length).toBeLessThanOrEqual(100);
    expect((server.title as string).length).toBeLessThanOrEqual(100);
  });

  it('declares both ways in — the hosted endpoint and the local package', () => {
    // "Remote and local" is a claim the registry can carry rather than only
    // the README. Losing either entry silently narrows what the listing says
    // this server is.
    expect(server.remotes).toHaveLength(1);
    expect(server.packages).toHaveLength(1);
  });
});

describe('server.json and package.json cannot disagree', () => {
  it('proves ownership of the npm package through mcpName', () => {
    // The registry reads this field out of the *published* manifest. Missing
    // or mismatched, the entry is refused — and npm will not let a version be
    // republished, so the fix is a version bump rather than an edit.
    expect(pkg.mcpName).toBe(server.name);
  });

  it('pins the npm entry to a version that was actually published', () => {
    // `packages[].version` names an artifact on npm, so it has to be this
    // package's version. The server entry's own `version` is a different
    // thing and moves on its own: the hosted lane can gain a capability —
    // the guest lane did — without the published package changing at all.
    for (const p of server.packages as RegistryPackage[]) {
      expect(p.version, p.identifier).toBe(pkg.version);
    }
    expect(server.version).toMatch(/^\d+\.\d+\.\d+$/);
    // The handshake too. It used to be a literal in server.ts, which is a
    // number that survives exactly one release: no client shows it twice, so
    // a stale one is never noticed.
    expect(readFileSync(fileURLToPath(new URL('src/server.ts', root)), 'utf8')).not.toMatch(
      /version:\s*'[\d.]+'/,
    );
  });

  it('points at the package that actually exists', () => {
    for (const p of (server.packages as RegistryPackage[]).filter((x) => x.registryType === 'npm')) {
      expect(p.identifier).toBe(pkg.name);
      expect(p.transport.type).toBe('stdio');
    }
  });
});

describe('the listing describes what is actually served', () => {
  it('does not promise a tool count the registry would out-date', () => {
    // The description says "twenty". If the registry grows past that, the
    // listing becomes wrong in the one place nobody re-reads.
    const claimed = /twenty/i.test(server.description as string) ? 20 : null;
    if (claimed !== null) expect(ALL_SPECS).toHaveLength(claimed);
  });
});
