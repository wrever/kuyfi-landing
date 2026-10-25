---
title: "Paid scan API"
description: "x402 OSINT endpoint."
slug: "paid-api"
source: kuyfi-docs
format: markdown-for-agents
note: "Plain Markdown for LLMs/agents — NOT MDX (Markdown+JSX)."
---

# Paid scan API

```
GET /scan/<CONTRACT_ID>
  → 402 Payment Required
  → 200 OK (scan surface)
```

**Scanner only.** Chaos Monkey never over HTTP.

Env: `PAY_TO` (public G…), `PRICE` (default `500 CLP`), `NETWORK`, `PORT` (4021).
