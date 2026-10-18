---
name: spec-idea
description: Use when someone wants to propose an idea for the ideaudit scoring tools (ideaudit-mcp) without writing code — turns it into a plain-language spec and files it as an issue in inite-ai/ideaudit-mcp.
---

# /spec-idea — propose, don't build

Explain in plain words as you go. No code, no branches.

1. Restate the idea; ask at most 3 clarifying questions.
2. Search first:
   `gh issue list -R inite-ai/ideaudit-mcp --search "<key words>" --state all`.
3. Write the issue body with these headings: **What do you want to be
   possible?** · **Who is it for / why** · **How would you know it works?**
   (an input and the output you'd expect) · **Spec** (tool(s), behaviour,
   does it move a verdict or the KILL gate, new tool or new optional input
   only, anything that would need network/storage — which belongs to the
   hosted server, not here — out of scope).
4. Show it, get a yes, then file:
   `gh issue create -R inite-ai/ideaudit-mcp --title "idea: <title>" --label idea --body-file <file>`.
   Without `gh`, give the person
   `https://github.com/inite-ai/ideaudit-mcp/issues/new?template=product-idea.yml`
   and the text to paste.
5. Share the issue link and what happens next (a maintainer reviews it; code
   changes are made in the private monorepo and arrive here by sync).

Use made-up numbers, never a real founder's figures.
