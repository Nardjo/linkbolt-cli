import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface ActionOpts {
  json?: boolean;
  format?: string;
}

/**
 * Fetch one Resource by id (GET /v1/resource?id=).
 */
export const resourceResource = new Command("resource").description(
  "Get a Resource owned by the credential's Propriétaire",
);

resourceResource
  .command("get")
  .description("Get Resource metadata by id (GET /v1/resource)")
  .argument("<id>", "Resource id")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText(
    "after",
    "\nExamples:\n  linkbolt-cli resource get <resourceId>\n  linkbolt-cli resource get <resourceId> --json",
  )
  .action(async (id: string, opts: ActionOpts) => {
    try {
      const data = await client.get("/v1/resource", { id });
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
