import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

/** Canonical retrieve path. Server still accepts /hermes/v1/retrieve; CLI uses /v1 only. */
export const RETRIEVE_PATH = "/v1/retrieve";

/** Default limit matches the machine API (server ceiling is 20). */
export const DEFAULT_RETRIEVE_LIMIT = "8";

export interface RetrieveOpts {
  json?: boolean;
  format?: string;
  q?: string;
  limit?: string;
  platform?: string;
  sourceKind?: string;
  since?: string;
}

/**
 * Map CLI flags to POST /v1/retrieve JSON.
 * Commander camelCases `--source-kind` to `sourceKind`.
 */
export function buildRetrieveBody(opts: RetrieveOpts): Record<string, unknown> {
  if (!opts.q) {
    throw new Error("retrieve requires --q");
  }

  const body: Record<string, unknown> = { q: opts.q };

  if (opts.limit !== undefined && opts.limit !== "") {
    body.limit = Number(opts.limit);
  }
  if (opts.platform) body.platform = opts.platform;
  if (opts.sourceKind) body.sourceKind = opts.sourceKind;
  if (opts.since) body.since = opts.since;

  return body;
}

/**
 * Grounding retrieve over the Propriétaire's Resources (POST /v1/retrieve).
 * Response is `{ hits, insufficient }` — no server-side `answer`.
 */
export const retrieveResource = new Command("retrieve")
  .description(
    "Retrieve grounding passages (POST /v1/retrieve). Returns hits + insufficient; no answer.",
  )
  .requiredOption("--q <query>", "Grounding query")
  .option("--limit <n>", "Max hits (server ceiling 20)", DEFAULT_RETRIEVE_LIMIT)
  .option("--platform <name>", "Filter by platform")
  .option("--source-kind <kind>", "Filter by source kind (JSON field sourceKind)")
  .option("--since <iso>", "Only hits since this ISO-8601 timestamp")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText(
    "after",
    [
      "",
      "Calls POST /v1/retrieve on the same base URL as search.",
      "Request JSON: { q, limit?, platform?, sourceKind?, since? }",
      "Response JSON: { hits, insufficient } — no answer field. Default limit 8.",
      "",
      "Examples:",
      "  linkbolt-cli retrieve --q 'react hooks' --json",
      "  linkbolt-cli retrieve --q 'demo' --limit 5 --platform youtube --source-kind video --since 2026-01-01T00:00:00Z --json",
    ].join("\n"),
  )
  .action(async (opts: RetrieveOpts) => {
    try {
      const data = await client.post(RETRIEVE_PATH, buildRetrieveBody(opts));
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
