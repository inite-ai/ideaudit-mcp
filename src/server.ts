/**
 * The local MCP server: the deterministic half of ideaudit, over stdio.
 *
 * No account, no key, no network. Every tool here is a pure function of its
 * input, so this runs offline and returns the same number the hosted platform
 * would return for the same arguments — because it is literally the same
 * specification object, imported rather than reimplemented.
 *
 * That property is the point of publishing it. The product's claim is that it
 * is allowed to say no, and a verdict nobody can inspect is a verdict nobody
 * has to believe. This is the arithmetic, exposed so you can disagree with it
 * on the numbers rather than on faith.
 *
 * What is deliberately absent: persistence, history, audit comparison, the
 * dashboard, and the data providers. Those need somewhere to keep things and
 * someone to pay for them, and they are the hosted product.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createRequire } from 'node:module';
import { ALL_SPECS } from './registry.js';
import type { AnyToolSpec } from './types.js';

/**
 * The version the MCP handshake reports.
 *
 * Read rather than written down. It was a literal, and a literal in a file
 * nobody edits during a release is a number that stops being true on the
 * first bump — quietly, because the handshake is not something anyone looks
 * at twice. `../package.json` resolves the same from `dist/server.js` and
 * from the bundled `dist/bundle.js`, which are the only two places this runs.
 */
const VERSION = (
  createRequire(import.meta.url)('../package.json') as { version: string }
).version;

/**
 * Top-level argument names the tool's own JSON Schema does not declare.
 *
 * Read off `jsonSchema` rather than the zod schema because that is what the
 * client was shown: if a key is not in what we advertised, we should not
 * pretend to have accepted it.
 */
export function unknownArgs(spec: AnyToolSpec, args: unknown): string[] {
  if (args === null || typeof args !== 'object' || Array.isArray(args)) return [];
  const declared = spec.jsonSchema.properties;
  if (declared === null || typeof declared !== 'object') return [];
  const known = new Set(Object.keys(declared));
  return Object.keys(args as Record<string, unknown>).filter((k) => !known.has(k));
}

export async function main(): Promise<void> {
  const server = new Server(
    { name: 'ideaudit-tools', version: VERSION },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: ALL_SPECS.map((s) => ({
      name: s.name,
      description: s.description,
      inputSchema: s.jsonSchema,
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const spec = ALL_SPECS.find((s) => s.name === req.params.name);
    if (!spec) {
      return {
        isError: true,
        content: [{ type: 'text' as const, text: `Unknown tool: ${req.params.name}` }],
      };
    }

    // An argument this server does not know is almost always one the hosted
    // server does: `auditId`, `persist`. Zod would strip it silently, and the
    // caller would get a correct verdict plus the false belief that it had
    // been written down somewhere. Say so instead.
    const unknown = unknownArgs(spec, req.params.arguments);
    if (unknown.length > 0) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                error: 'unknown_arguments',
                unknown,
                message:
                  'This server computes; it stores nothing. Arguments that name something to save are only honoured by the hosted server at https://api.inite.studio/mcp.',
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    // Validate before calling. The hosted server does the same, and a tool
    // that accepts something here and rejects it there would be worse than
    // one that is simply absent.
    const parsed = spec.schema.safeParse(req.params.arguments ?? {});
    if (!parsed.success) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ error: 'invalid_input', detail: parsed.error.issues }, null, 2),
          },
        ],
      };
    }

    try {
      const result = (spec.fn as (i: unknown) => unknown)(parsed.data);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      // Surfaced verbatim rather than paraphrased, for the same reason the
      // skills insist on it: a summarised failure hides which input broke.
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              { error: 'tool_failed', message: err instanceof Error ? err.message : String(err) },
              null,
              2,
            ),
          },
        ],
      };
    }
  });

  await server.connect(new StdioServerTransport());
}
