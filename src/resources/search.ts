import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface ActionOpts {
  json?: boolean;
  format?: string;
  fields?: string;
  q?: string;
  limit?: string;
}

/**
 * Hybrid search over the Propriétaire's Resources (POST /v1/search).
 */
export const searchResource = new Command("search").description(
  "Search Resources (hybrid lexical + semantic)",
);

searchResource
  .command("query")
  .description("Run a hybrid search (POST /v1/search)")
  .requiredOption("--q <query>", "Search query")
  .option("--limit <n>", "Max hits", "20")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText(
    "after",
    "\nExamples:\n  linkbolt-cli search query --q 'example domain'\n  linkbolt-cli search query --q 'react' --limit 5 --json",
  )
  .action(async (opts: ActionOpts) => {
    try {
      const body: Record<string, unknown> = { q: opts.q };
      if (opts.limit) body.limit = Number(opts.limit);
      const data = await client.post("/v1/search", body);
      const fields = opts.fields?.split(",");
      output(data, { json: opts.json, format: opts.format, fields });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
