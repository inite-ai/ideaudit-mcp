#!/usr/bin/env node
// The bundle, not dist/index.js: the unbundled build imports workspace
// packages that are not published, so it runs here and nowhere else.
import { main } from '../dist/bundle.js';

main().catch((err) => {
  // stderr, never stdout: stdout is the MCP transport, and a stray line
  // there corrupts the protocol rather than reporting the problem.
  console.error('[ideaudit-tools] failed to start:', err);
  process.exit(1);
});
