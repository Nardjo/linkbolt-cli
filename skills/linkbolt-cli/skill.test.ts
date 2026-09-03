import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const skill = readFileSync(join(import.meta.dir, "SKILL.md"), "utf8");

describe("linkbolt-cli skill — retrieve grounding contract", () => {
  test("documents retrieve usage and hits-only response", () => {
    expect(skill).toContain("linkbolt-cli retrieve --q");
    expect(skill).toContain("POST /v1/retrieve");
    expect(skill).toContain("{ hits, insufficient }");
    expect(skill).toContain("--platform");
    expect(skill).toContain("--source-kind");
    expect(skill).toContain("--since");
  });

  test("explicit: no server LLM; generation is agent-side", () => {
    expect(skill).toMatch(/no server LLM/i);
    expect(skill).toContain("agent-side");
    expect(skill).toContain("does **not** return `answer`");
  });

  test("cite every claim or refuse", () => {
    expect(skill).toContain("resourceId");
    expect(skill).toMatch(/excerpt/);
    expect(skill).toMatch(/insufficient.*true/i);
    expect(skill).toMatch(/refuse/i);
    expect(skill).toMatch(/live-web/i);
    expect(skill).toMatch(/general knowledge/i);
  });

  test("language + Extraction/Transcription + token safety", () => {
    expect(skill).toContain("Langue de contenu");
    expect(skill).toContain("Extraction / Transcription");
    expect(skill).toContain("Never paste");
    expect(skill).toContain("lbk_live_");
    expect(skill).not.toMatch(/lbk_live_[A-Za-z0-9]{8,}/);
  });
});
