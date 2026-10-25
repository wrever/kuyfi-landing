---
title: "CLI reference"
description: "kuyfi and kuyfi-server."
slug: "cli"
source: kuyfi-docs
format: markdown-for-agents
note: "Plain Markdown for LLMs/agents — NOT MDX (Markdown+JSX)."
---

# CLI reference

## Binaries

- `kuyfi` → `dist/cli.js`
- `kuyfi-server` → `dist/server.js`

## Usage

```bash
kuyfi
kuyfi <CONTRACT_ID>
kuyfi <CONTRACT_ID> --json --pdf
```

Contract ID: `/^C[A-Z0-9]{55}$/`

RPC: `https://soroban-testnet.stellar.org` (hardcoded)
