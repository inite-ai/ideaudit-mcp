import type { ZodSchema } from 'zod';
/**
 * A deterministic tool: a name, a schema, and a pure function.
 *
 * This shape is the seam that makes the split possible. The hosted platform
 * wraps the same spec with quota, metering and persistence; the local server
 * calls `fn` and returns the result. Neither copy re-declares the schema or
 * the description, which is what stops the two drifting into disagreement
 * about what a tool is called or what it accepts.
 *
 * `fn` is synchronous and total by construction. If a tool needs the network,
 * a database or a key, it does not belong here — it belongs to the platform.
 */
export interface ToolSpec<I = unknown, O = unknown> {
    name: string;
    description: string;
    schema: ZodSchema<I>;
    /** Hand-written rather than derived: this repository does not generate them. */
    jsonSchema: Record<string, unknown>;
    fn: (input: I) => O;
}
/** Narrow a spec list to a lookup, failing loudly on a duplicate name. */
export declare function indexSpecs(specs: AnyToolSpec[]): Map<string, AnyToolSpec>;
/**
 * Identity with inference. Lets a spec be written as a literal and still get
 * its input and output types from the schema and the function, rather than
 * being widened to `unknown` by an explicit annotation.
 */
export declare function defineSpec<I, O>(spec: ToolSpec<I, O>): ToolSpec<I, O>;
/**
 * A spec with its input and output types erased, for the places that hold a
 * heterogeneous list of them — the registry and the server dispatch.
 *
 * Structural rather than `ToolSpec<any, any>`: the server only ever needs to
 * validate and then call, so those are the only two capabilities it asks for.
 * That keeps `any` out of the package entirely, and it means a spec whose
 * schema does not actually validate cannot be added to the list.
 */
export interface AnyToolSpec {
    name: string;
    description: string;
    schema: {
        safeParse: (value: unknown) => {
            success: true;
            data: unknown;
        } | {
            success: false;
            error: {
                issues: unknown;
            };
        };
    };
    jsonSchema: Record<string, unknown>;
    fn: (input: never) => unknown;
}
//# sourceMappingURL=types.d.ts.map