@AGENTS.md

## Claude Code notes

- This repo is a force-pushed mirror: `/contribute` ends in an **issue** with a
  reproducible input, not a PR. `/spec-idea` files an idea directly.
- Safe to run without asking: `npm install --no-package-lock`,
  `node --check bin/mcp.js`, `node scripts/verify-dist.mjs`,
  `node scripts/call-tool.mjs …`,
  `npm pack --dry-run`, `npm start` (local stdio server, no network).
- Ask first: any commit or push here, editing `dist/`, `src/`, `bin/`,
  `package.json` or `server.json`, `npm publish`.
- Keep personal permissions in `.claude/settings.local.json` (git-ignored).
