import { Command } from "commander";
import { getToken, setToken, removeToken, hasToken, maskToken } from "../lib/auth.js";
import { client } from "../lib/client.js";
import { log } from "../lib/logger.js";
import { handleError } from "../lib/errors.js";

export const authCommand = new Command("auth").description("Manage API authentication");

authCommand
  .command("set")
  .description("Save your machine API token (lbk_live_…)")
  .argument("<token>", "Bearer token from Compte → Clés machine")
  .addHelpText("after", "\nExample:\n  linkbolt-cli auth set lbk_live_…")
  .action((token: string) => {
    setToken(token);
    log.success("Token saved securely");
  });

authCommand
  .command("show")
  .description("Display current token (masked by default)")
  .option("--raw", "Show the full unmasked token")
  .addHelpText("after", "\nExample:\n  linkbolt-cli auth show\n  linkbolt-cli auth show --raw")
  .action((opts: { raw?: boolean }) => {
    if (!hasToken()) {
      log.warn("No token configured. Run: linkbolt-cli auth set <token>");
      return;
    }
    const token = getToken();
    console.log(opts.raw ? token : `Token: ${maskToken(token)}`);
  });

authCommand
  .command("remove")
  .description("Delete the saved token")
  .addHelpText("after", "\nExample:\n  linkbolt-cli auth remove")
  .action(() => {
    removeToken();
    log.success("Token removed");
  });

authCommand
  .command("test")
  .description("Verify the token with POST /v1/search")
  .addHelpText("after", "\nExample:\n  linkbolt-cli auth test")
  .action(async () => {
    try {
      // Authenticated search; empty-ish query still proves the Bearer works.
      await client.post("/v1/search", { q: "auth-test", limit: 1 });
      log.success("Token is valid");
    } catch (err) {
      handleError(err);
    }
  });
