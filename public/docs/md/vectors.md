---
title: "Attack vectors reference"
description: "Complete Chaos Monkey vector catalog."
slug: "vectors"
source: kuyfi-docs
format: markdown-for-agents
note: "Plain Markdown for LLMs/agents — NOT MDX (Markdown+JSX)."
---

# Attack vectors reference

## Math / boundary (`fuzzer_math.ts`)

OAT mutations. Labels: `ZERO`, `ONE`, `NEG_ONE`, `MAX_*`/`MIN_*`, `RANDOM_ADDR_A/B`, `EMPTY_BYTES`, `EMPTY_VEC`, `NONE`, recursive UDTs. Names like `amount::MAX_I128`.

## Authorization (`fuzzer_access.ts`)

| Vector | Targets |
|--------|---------|
| `UNAUTHORIZED_CALL` | Admin-pattern names |
| `REINIT_ATTACK` | initialize / init / setup |
| `SELF_CALL_ATTACK` | set_admin family |
| `UNAUTHORIZED_ADDR_CALL` | Non-admin + Address param |

Admin substrings: pause, unpause, initialize, init, setup, upgrade, set_admin, set_pending_admin, transfer_admin, emergency.

## Call ordering

`REINIT_SEQUENCE`, `REPEATED_WITHDRAW_SEQUENCE`, `REPEATED_CLAIM_SEQUENCE`

## Fee / BPS

`BPS_*`: 0, 1, 9999, 10000, 10001, type max

## Liquidity

`ZERO_A_MAX_B`, `MAX_A_MAX_B`, … on swap/reserve-shaped names
