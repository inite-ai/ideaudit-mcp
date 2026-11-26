---
name: contribute
description: Use when someone says "I have an idea", "this score looks wrong", "I want to add / change / fix something" in ideaudit-mcp (the ideaudit deterministic scoring tools, a mirror of a private monorepo) — reproduces the case with the local server, writes a spec, and files an issue; explains why a PR here would be lost.
---

# /contribute — ideaudit-mcp

The person may not be an engineer. Say what you are doing, and why, in plain
words at every step. `AGENTS.md` is the source of truth.

## 0. Say this first

This repository is a **mirror**: it is rebuilt and force-pushed from a private
monorepo, so a code change or PR made here is overwritten by the next sync.
The useful thing to make here is an **issue** a maintainer can act on — and
because every tool is deterministic, a precise input and output settle it.
(If the person has access to `inite-ai/initeaudit`, the code change belongs
there; point them to `packages/audit-tools` and stop.)

## 1. Understand

Restate the idea or disagreement in two or three plain sentences. Ask at most
3 clarifying questions: which tool, which input, what they expected and why.

Search first:
`gh issue list -R inite-ai/ideaudit-mcp --search "<key words>" --state all`.
If it exists, offer to add the reproduction as a comment.

## 2. Reproduce

```bash
npm install --no-package-lock
node scripts/verify-dist.mjs        # the local copy is sane
```

Then call the tool with their input through the local server and show the
person the exact output:

```bash
node scripts/call-tool.mjs --list                      # if you need the tool's input schema
node scripts/call-tool.mjs <tool_name> '<arguments JSON>'
``` Find the
constant or rule involved in `dist/bundle.js` (the compiled maths, readable)
or the tool's `src/specs/<tool>.ts` (its schema and description), and quote
the lines.

Reduce real figures to a minimal made-up input that still reproduces — never
put a founder's real numbers in a public issue.

## 3. Spec

Headings: **What do you want to be possible?** · **Who is it for / why** ·
**How would you know it works?** (input → expected output) · **Spec**: tool(s),
input (JSON), actual output, expected output, the constant/rule quoted from
`dist/bundle.js`, does it move a verdict or touch the KILL gate (AGENTS.md
rule 3), contract impact (tool names/inputs — rule 1), out of scope.

## 4. File

Show the text, get a yes, then:

```bash
gh issue create -R inite-ai/ideaudit-mcp --title "<idea: … | bug: …>" --label <idea|bug> --body-file <file>
```

Without `gh`: `https://github.com/inite-ai/ideaudit-mcp/issues/new/choose`
and the text to paste. Share the link and what happens next: a maintainer
reproduces it with the same input and, if accepted, fixes it in the monorepo;
the fix arrives here by sync.

Do not commit, branch or open a PR here unless a maintainer explicitly asked
for a change to this repo's own docs or tooling.
