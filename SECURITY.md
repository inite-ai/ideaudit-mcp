# Security policy

**Do not open a public issue for a vulnerability.** Report it privately:

- GitHub: **Security → Report a vulnerability** on
  [inite-ai/ideaudit-mcp](https://github.com/inite-ai/ideaudit-mcp)
  (private vulnerability reporting), or
- email **security@inite.ai**.

Include what is wrong, how to reproduce it (`node scripts/call-tool.mjs …`
output is ideal), and the version from `package.json`. We acknowledge within
a few working days and credit reporters who want it.

In scope: the published MCP server (`dist/`, `bin/`), its tools and their
inputs, and the package `@inite/ideaudit-tools`. Issues in the hosted INITE audit service
are reported the same way.
