#!/usr/bin/env node
/**
 * Call one tool on the local server and print its answer — the reproduction
 * an issue needs, without registering the server in an MCP client first.
 *
 * It goes through bin/mcp.js over stdio, exactly as a client would, so the
 * output is what a client sees: validation, the unknown-argument refusal and
 * all.
 *
 * Usage:
 *   node scripts/call-tool.mjs --list
 *   node scripts/call-tool.mjs <tool_name> '<arguments JSON>'
 *   node scripts/call-tool.mjs compute_barrier '{"directCompetitorCount": 3}'
 */
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const [name, raw = '{}'] = process.argv.slice(2);
if (!name) {
  console.error("usage: node scripts/call-tool.mjs <tool_name> '<arguments JSON>' | --list");
  process.exit(2);
}

let args;
try {
  args = JSON.parse(raw);
} catch (err) {
  console.error(`arguments are not valid JSON: ${err.message}`);
  process.exit(2);
}

const client = new Client({ name: 'call-tool', version: '0' }, { capabilities: {} });
await client.connect(
  new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL('../bin/mcp.js', import.meta.url))],
  }),
);

try {
  if (name === '--list') {
    const { tools } = await client.listTools();
    for (const t of tools) console.log(`${t.name}\n  ${t.description}\n  input: ${JSON.stringify(t.inputSchema)}\n`);
  } else {
    const result = await client.callTool({ name, arguments: args });
    console.log(result.content.map((c) => c.text).join('\n'));
    if (result.isError) process.exitCode = 1;
  }
} finally {
  await client.close();
}
