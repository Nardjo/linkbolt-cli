import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface ActionOpts {
  json?: boolean;
  format?: string;
  url?: string;
}

/**
 * Capture = create or find a Resource for a URL (machine API POST /v1/capture).
 */
export const captureResource = new Command("capture").description(
  "Capture a Source URL into a Resource (idempotent per Propriétaire)",
);

captureResource
  .command("create")
  .description("Capture a URL (POST /v1/capture)")
  .requiredOption("--url <url>", "Source URL to capture")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText(
    "after",
    "\nExamples:\n  linkbolt-cli capture create --url 'https://example.com/article'\n  linkbolt-cli capture create --url 'https://example.com/' --json",
  )
  .action(async (opts: ActionOpts) => {
    try {
      const data = await client.post("/v1/capture", { url: opts.url });
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
