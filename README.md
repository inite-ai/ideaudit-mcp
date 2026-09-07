# ideaudit-tools

The deterministic scoring behind [ideaudit](https://inite.studio), as a local
MCP server. No account, no key, no network, no model calls — just the
arithmetic.

```bash
claude mcp add ideaudit-tools -- npx -y @inite/ideaudit-tools
```

Listed in the MCP registry as `studio.inite/ideaudit-tools`, which carries
both ways in: this package over stdio, and the hosted server over HTTP.
Installing straight from this repository — `npx -y github:inite-ai/ideaudit-mcp`
— also works and runs the same code.

## Why this is published

The product's claim is that it is an audit *allowed to say no*. A verdict
nobody can inspect is a verdict nobody has to believe, so the part that
produces the number is open — including the number that says no. You can read
how three lens scores become `KILL`, disagree with the thresholds, and argue
about the arithmetic rather than about our word.

It is also the honest shape of the system. The server makes zero model calls;
judgement lives in the skills, determinism lives in the tools. These are the
tools.

## What runs locally

Twenty tools, every one a pure function of its input:

| | |
|---|---|
| **The verdict** | `compute_dealbreakers_v2`, `compute_crossed_matrix`, `derive_kill_criteria` |
| Composite scoring | `compute_lrs_composite`, `compute_lrs_composite_v2`, `compute_urgency_composite`, `compute_collection_scores` |
| Market shape | `compute_barrier`, `compute_multi_source_tam`, `compute_search_velocity`, `compute_search_velocity_v2`, `compute_social_pain` |
| Money | `validate_unit_economics`, `compute_monetization`, `compute_budget_proof`, `compute_ppc_spend_signal` |
| Signals | `compute_funding_momentum`, `compute_hiring_demand`, `compute_x_signal`, `compute_build_complexity` |

`compute_dealbreakers_v2` is the one that decides. Stage-aware weights,
confidence-weighted lens scores, and a deliberately risk-asymmetric verdict:
`GO` needs a score ≥ 80 *and* zero red flags *and* average confidence ≥ 0.6,
while the `KILL` gate is observer-invariant — a founder profile shifts every
threshold above the gate, and none of them below it. You cannot buy a better
answer by describing yourself more favourably. There is a test that says so.

Same input, same output as the hosted server — because it is the same
specification object, imported rather than reimplemented. A test asserts that
identity rather than comparing two copies, so the two cannot drift.

## Where to look

Be told where the numbers are rather than hunt for them:

- **`src/specs/*.ts`** — one file per tool: what it accepts, what it means,
  what it returns. `compute-dealbreakers-v2.ts` is the verdict.
- **`src/server.ts`** — the whole server, including what it refuses.
- **`src/__tests__/parity.test.ts`** — the claims above, as assertions. The
  observer-invariant KILL gate is checked against all five archetypes.
- **`dist/bundle.js`** — the arithmetic, un-minified. `computeBarrier` is a
  dozen lines and every constant is visible: 0.6 off the score per direct
  competitor, 0.2 per adjacent, six points of range spent on SERP noise, and
  labels at 18 / 12 / 6. Disagree with those numbers, not with our word.

That last one is a build artefact and reads like one — the commented source
of the maths lives in the monorepo this repository is mirrored from, and is
not here. If you want the reasoning behind a threshold rather than the
threshold itself, open an issue and ask; that is a cheaper conversation than
either of us pretending.

## What needs the hosted server

Not withheld to make a point — these genuinely need somewhere to keep things
and someone to pay for them:

- **Persistence.** Saving an audit, finalising it, reading it back, comparing
  two of them, the dashboard. A verdict that exists only in a chat transcript
  is one nobody can re-open or defend later.
- **Data.** SERP, keyword volume, funding rounds, hiring signals, social
  mentions. Those are metered third-party APIs.
- **The knowledge graph.** Entities, evidence, contradictions across audits.

That boundary is enforced rather than documented. The hosted
`compute_dealbreakers_v2` takes an `auditId`; this one refuses it, by name,
instead of letting zod strip it silently and handing you a correct verdict
plus the false belief that it had been written down.

```
$ compute_dealbreakers_v2 {"auditId": "…", …}
{ "error": "unknown_arguments", "unknown": ["auditId"],
  "message": "This server computes; it stores nothing. …" }
```

## The hosted server

```bash
claude mcp add ideaudit --transport http https://api.inite.studio/mcp \
  --scope user --header "Authorization: Bearer $IDEAUDIT_API_KEY"
```

It serves these twenty tools and everything above them. Sign up at
[inite.studio](https://inite.studio); `--scope user` matters, or the
registration is bound to one directory.

## Using both

They compose. Register the local server for the arithmetic and the hosted one
for everything else; tool names do not collide because the local set is a
strict subset served under the same names, so whichever you register wins for
those twenty and the rest resolve to the platform.

If you only want to check our maths against your own numbers, the local server
alone is enough and always will be.

## Contributing, and a warning about it

This repository is a projection. It is rebuilt and force-pushed from the
monorepo that develops it every time the package changes, which means a pull
request opened here would be overwritten by the next sync — through no fault
of yours, and with no notification. Saying so is cheaper than letting someone
find out by losing an afternoon.

Issues are the right channel and they are read: a threshold you think is
wrong, a number you cannot reproduce, a tool that accepts something it should
refuse. Bring the input you used — every tool here is deterministic, so a
disagreement about an answer is always settleable.

## Licence

Apache-2.0. See `LICENSE`.
