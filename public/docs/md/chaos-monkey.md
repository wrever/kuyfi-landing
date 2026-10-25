---
title: "Chaos Monkey"
description: "Type-aware fuzzing — simulate first."
slug: "chaos-monkey"
source: kuyfi-docs
format: markdown-for-agents
note: "Plain Markdown for LLMs/agents — NOT MDX (Markdown+JSX)."
---

# Chaos Monkey

Not random dumb fuzzing. Type-aware attack values; one variable at a time.

## Execution

```
vector → simulate
  fail → classify diagnostics (nothing sent)
  ok   → sign ephemeral Friendbot key → broadcast Testnet → poll → classify
```

**Type-correct ≠ semantically valid.** Random Address ≠ admin.

## Five families

1. Math / boundary
2. Authorization / access control
3. Call ordering
4. Fee / BPS
5. Liquidity ratio

See full catalog: /docs/vectors

Keys never persisted. Testnet only.
