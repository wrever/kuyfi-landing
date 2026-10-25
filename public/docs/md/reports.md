---
title: "Reports"
description: "JSON/PDF from one SecurityReport."
slug: "reports"
source: kuyfi-docs
format: markdown-for-agents
note: "Plain Markdown for LLMs/agents — NOT MDX (Markdown+JSX)."
---

# Reports

One `SecurityReport` (`schemaVersion: "1.0.0"`). JSON and PDF are the same object.

## Evidence

- Run-wide counters
- Per-finding simulation/broadcast + trace
- Hash, ledger, stellar.expert URL when broadcast
- `verificationTransactions` sample (first success + first fail)

TUI: `[J]` `[P]` `[B]` · CLI: `--json` `--pdf`

Schema details: /docs/report-schema
