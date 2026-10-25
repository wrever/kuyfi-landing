---
title: "Troubleshooting"
description: "Common failures."
slug: "troubleshooting"
source: kuyfi-docs
format: markdown-for-agents
note: "Plain Markdown for LLMs/agents — NOT MDX (Markdown+JSX)."
---

# Troubleshooting

## Scanner

| Code | Try |
|------|-----|
| CONTRACT_NOT_FOUND | Confirm Testnet deploy / typo |
| RPC_UNAVAILABLE | Network / retry |
| XDR_ALIGN_FAILURE | Need standard contractspecv0 |

## Chaos Monkey

Many PRECONDITION results = normal (ephemeral account not authorized).
Zero findings ≠ secure.

## Windows

Use `kuyfi.cmd` if PowerShell blocks `.ps1`.
