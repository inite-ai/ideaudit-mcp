import type { AnyToolSpec } from './types.js';
/**
 * Top-level argument names the tool's own JSON Schema does not declare.
 *
 * Read off `jsonSchema` rather than the zod schema because that is what the
 * client was shown: if a key is not in what we advertised, we should not
 * pretend to have accepted it.
 */
export declare function unknownArgs(spec: AnyToolSpec, args: unknown): string[];
export declare function main(): Promise<void>;
//# sourceMappingURL=server.d.ts.map