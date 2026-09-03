---
name: linkbolt-cli
description: "Manage Linkbolt Capture / search / retrieve / Resource via machine API CLI. Use when the user mentions Linkbolt, capture a URL, search inbox Resources, machine grounding retrieve, machine keys, lbk_live, or wants agent access to Linkbolt."
category: productivity
---

# linkbolt-cli

Agent-ready CLI for the Linkbolt **machine API** (`https://convex-site.linkbolt.app`). Same Capture / search / retrieve / Resource domain as the web app. Auth = Bearer `lbk_live_…` from **Compte → Clés machine**.

Canonical HTTP paths: `/v1/*`. Server still accepts `/hermes/v1/*` as aliases.

## When To Use This Skill

- Capture a URL into a Resource
- Search the Propriétaire's Inbox / Resources
- Retrieve grounding passages (`POST /v1/retrieve`) — hits + `insufficient`, no `answer`
- Fetch one Resource by id
- Authenticate or rotate a machine key for Linkbolt
- Give an agent (Alfred, Hermes, scripts) API access to Linkbolt

## Setup

```bash
bun --version || curl -fsSL https://bun.sh/install | bash
npx api2cli install Nardjo/linkbolt-cli
# or from ~/.cli/linkbolt-cli:
npx api2cli bundle linkbolt
npx api2cli link linkbolt
```

Always pass `--json` for agent-driven calls.

## Authentication

Create a key in the web app: **Compte → Clés machine** (label e.g. `Alfred`). Token shown once.

```bash
linkbolt-cli auth set "lbk_live_…"
linkbolt-cli auth test
linkbolt-cli auth show
```

Token file: `~/.config/tokens/linkbolt-cli.txt` (chmod 600). Never commit it. Never paste it into chat.

## Working Rules

1. Always `--json` for agent parsing.
2. Prefer `search query` / `retrieve` / `resource get` before mutating with `capture create`.
3. Capture is idempotent on canonical URL for that Propriétaire.
4. `401` = missing/invalid/revoked token. `429` = shared quota — honor `Retry-After`.
5. Do not invent Resource ids. Do not call `/hermes/v1/*` from this CLI (canonical `/v1/*` only).

## Resources

### `capture`

| Action | Command | Notes |
|--------|---------|--------|
| create | `linkbolt-cli capture create --url <url> --json` | `POST /v1/capture` → `resourceId`, `created`, `canonicalUrl`, `title` |

### `search`

| Action | Command | Notes |
|--------|---------|--------|
| query | `linkbolt-cli search query --q <query> [--limit 20] --json` | `POST /v1/search` — hybrid hits are Resources + passage |

### `retrieve`

| Action | Command | Notes |
|--------|---------|--------|
| retrieve | `linkbolt-cli retrieve --q <query> [--limit 8] [--platform <name>] [--source-kind <kind>] [--since <iso>] --json` | `POST /v1/retrieve` — `{ hits, insufficient }`, no `answer`. `--source-kind` maps to JSON `sourceKind`. Default limit 8 (server ceiling 20). |

### `resource`

| Action | Command | Notes |
|--------|---------|--------|
| get | `linkbolt-cli resource get <id> --json` | `GET /v1/resource?id=` — cross-tenant → `404` |

### `auth`

| Action | Command |
|--------|---------|
| set | `linkbolt-cli auth set <token>` |
| show | `linkbolt-cli auth show` / `--raw` |
| remove | `linkbolt-cli auth remove` |
| test | `linkbolt-cli auth test` |

## Output Format

`--json` returns a standardized envelope:

```json
{ "ok": true, "data": { ... }, "meta": { "total": 42 } }
```

On error: `{ "ok": false, "error": { "message": "...", "status": 401 } }`

## Quick Reference

```bash
linkbolt-cli --help
linkbolt-cli capture create --help
linkbolt-cli search query --help
linkbolt-cli retrieve --help
linkbolt-cli resource get --help
linkbolt-cli auth --help
```

## Docs

Source of truth in the product repo: `docs/agents/machine-api.md` (Linkbolt).
