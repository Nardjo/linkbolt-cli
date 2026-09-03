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
- Answer a question from the Propriétaire corpus: call `retrieve`, then generate **agent-side** from cited passages only
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

Token file: `~/.config/tokens/linkbolt-cli.txt` (chmod 600). Never commit it. Never paste tokens (`lbk_live_…`) into chat, commits, logs, or PR bodies.

## Working Rules

1. Always `--json` for agent parsing.
2. Prefer `search query` / `retrieve` / `resource get` before mutating with `capture create`.
3. Capture is idempotent on canonical URL for that Propriétaire.
4. `401` = missing/invalid/revoked token. `429` = shared quota — honor `Retry-After`.
5. Do not invent Resource ids. Do not call `/hermes/v1/*` from this CLI (canonical `/v1/*` only).
6. Grounded answers: generate **only** from `retrieve` passages (no server LLM). Cite `resourceId` + excerpt/passage on every claim, or refuse. See [Retrieve grounding](#retrieve-grounding-cite-every-claim-or-refuse).

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
| retrieve | `linkbolt-cli retrieve --q <query> [--limit 8] [--platform <name>] [--source-kind <kind>] [--since <iso>] --json` | `POST /v1/retrieve` — `{ hits, insufficient }` only. **No `answer`.** No server LLM. `--source-kind` maps to JSON `sourceKind`. Default limit 8 (server ceiling 20). Optional filters: `--platform`, `--source-kind`, `--since`. |

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

## Retrieve grounding (cite every claim or refuse)

Linkbolt retrieve is a **hits-only** grounding endpoint. The server does **not** run an LLM and does **not** return `answer`. Generation is **agent-side**, from the passages in `hits`.

```bash
linkbolt-cli retrieve --q '<question>' --json
# optional filters (narrow the corpus, then still cite-or-refuse):
linkbolt-cli retrieve --q '<question>' --platform youtube --source-kind video --since 2026-01-01T00:00:00Z --json
```

Response shape: `{ hits, insufficient }`. Each hit includes at least `resourceId` and a `passage` (and/or `excerpt`). Prefer **Extraction / Transcription** passages already returned as excerpts over titles, metadata, or a later `resource get`.

### Contract

1. **Passages only.** Answer exclusively from retrieve `hits`. Do not invent. Do not use live-web search or general knowledge as fallback.
2. **Cite every claim.** Each factual claim must cite `resourceId` **and** an excerpt (or the hit `passage`). If you cannot attach both, **refuse** that claim.
3. **Refuse when empty.** If `insufficient` is `true`, or `hits` is missing/empty, refuse explicitly. Do not guess, pad, or switch to another source.
4. **Language.** Write the answer in the Propriétaire **Langue de contenu** (content language of the retrieved passages), not the query language unless they match.
5. **No tokens.** Never paste `lbk_live_…` tokens.

### Citation shape

```
<claim> ([<resourceId>]: "<excerpt or passage>")
```

Example (illustrative ids only):

```
Hooks let you use state without a class ([res_example]: "Hooks let you use state and other React features without writing a class.")
```

### Refuse (explicit)

Say you are refusing and why. Do not answer around the gap.

- `insufficient: true` or empty `hits` → refuse: retrieve returned no sufficient passages.
- Claim without `resourceId` + excerpt/passage → omit or refuse that claim; do not invent a citation.

### Not this

- Do not treat `search query` as a substitute for retrieve when grounding an answer.
- Do not call a fake `/v1/ask` or expect the server to write the answer.
- Do not “complete” thin hits with model knowledge.

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
