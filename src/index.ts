#!/usr/bin/env bun
import { Command } from "commander";
import { globalFlags } from "./lib/config.js";
import { authCommand } from "./commands/auth.js";
import { captureResource } from "./resources/capture.js";
import { searchResource } from "./resources/search.js";
import { resourceResource } from "./resources/resource.js";

const program = new Command();

program
  .name("linkbolt-cli")
  .description(
    "CLI for the Linkbolt machine API (Capture / search / Resource). Docs: docs/agents/machine-api.md",
  )
  .version("0.1.0")
  .option("--json", "Output as JSON", false)
  .option("--format <fmt>", "Output format: text, json, csv, yaml", "text")
  .option("--verbose", "Enable debug logging", false)
  .option("--no-color", "Disable colored output")
  .option("--no-header", "Omit table/csv headers (for piping)")
  .hook("preAction", (_thisCmd, actionCmd) => {
    const root = actionCmd.optsWithGlobals();
    globalFlags.json = root.json ?? false;
    globalFlags.format = root.format ?? "text";
    globalFlags.verbose = root.verbose ?? false;
    globalFlags.noColor = root.color === false;
    globalFlags.noHeader = root.header === false;
  });

program.addCommand(authCommand);
program.addCommand(captureResource);
program.addCommand(searchResource);
program.addCommand(resourceResource);

program.parse();
