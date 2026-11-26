/**
 * The published surface.
 *
 * `index.ts` exports every individual spec, because the hosted platform in
 * this repository imports them one by one to wrap each with quota and
 * persistence. Those exports carry result types that come from
 * `@ideaudit/enrichment-math`, which is not published — so a declaration file
 * describing them would reference a package the installed copy does not have.
 *
 * This entry is what the tarball advertises instead: the server, the registry
 * and the spec shape, all of whose types are declared here in this package
 * and therefore resolve wherever it is installed. The bundled JavaScript still
 * contains every tool; this narrows what is *typed*, not what runs.
 */
export { ALL_SPECS } from './registry.js';
export { main } from './server.js';
export { indexSpecs, defineSpec, type ToolSpec, type AnyToolSpec } from './types.js';
