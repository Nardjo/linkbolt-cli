# linkbolt-cli

Agent-ready CLI for the [Linkbolt](https://github.com/Nardjo/linkbolt) machine API (`https://convex-site.linkbolt.app`).

Auth: Bearer `lbk_live_…` from **Compte → Clés machine**. Canonical paths `/v1/*` (`/hermes/v1/*` aliases still work on the server).

## Install

```bash
npx api2cli install Nardjo/linkbolt-cli
# or locally:
npx api2cli bundle linkbolt
npx api2cli link linkbolt
```

## Auth

```bash
linkbolt-cli auth set "lbk_live_…"
linkbolt-cli auth test
```

## Commands

```bash
linkbolt-cli capture create --url 'https://example.com/' --json
linkbolt-cli search query --q 'example' --limit 5 --json
linkbolt-cli resource get <resourceId> --json
```

Always pass `--json` for agent-driven calls.
