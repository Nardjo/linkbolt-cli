import { describe, expect, test } from "bun:test";
import { buildRetrieveBody, DEFAULT_RETRIEVE_LIMIT, RETRIEVE_PATH } from "./retrieve.ts";

/** Dry redacted sample — never include real lbk_live_ tokens. */
const SAMPLE_REQUEST = {
  q: "react hooks",
  limit: 8,
  platform: "youtube",
  sourceKind: "video",
  since: "2026-01-01T00:00:00Z",
};

const SAMPLE_RESPONSE = {
  hits: [
    {
      resourceId: "res_example",
      passage: "Hooks let you use state and other React features without writing a class.",
      score: 0.91,
    },
  ],
  insufficient: false,
};

describe("retrieve contract", () => {
  test("hits canonical POST /v1/retrieve (not a fake ask)", () => {
    expect(RETRIEVE_PATH).toBe("/v1/retrieve");
  });

  test("default limit is 8", () => {
    expect(Number(DEFAULT_RETRIEVE_LIMIT)).toBe(8);
  });

  test("sample payload has hits + insufficient and no answer", () => {
    expect(SAMPLE_REQUEST).toEqual({
      q: "react hooks",
      limit: 8,
      platform: "youtube",
      sourceKind: "video",
      since: "2026-01-01T00:00:00Z",
    });
    expect(SAMPLE_RESPONSE).toEqual({
      hits: expect.any(Array),
      insufficient: false,
    });
    expect(SAMPLE_RESPONSE).not.toHaveProperty("answer");
  });
});

describe("buildRetrieveBody", () => {
  test("sends required q and default limit", () => {
    expect(buildRetrieveBody({ q: "react hooks", limit: DEFAULT_RETRIEVE_LIMIT })).toEqual({
      q: "react hooks",
      limit: 8,
    });
  });

  test("maps --source-kind to JSON sourceKind and keeps optional filters", () => {
    expect(
      buildRetrieveBody({
        q: "demo",
        limit: "5",
        platform: "youtube",
        sourceKind: "video",
        since: "2026-01-01T00:00:00Z",
      }),
    ).toEqual({
      q: "demo",
      limit: 5,
      platform: "youtube",
      sourceKind: "video",
      since: "2026-01-01T00:00:00Z",
    });
  });

  test("omits empty optional filters", () => {
    expect(buildRetrieveBody({ q: "x" })).toEqual({ q: "x" });
  });

  test("requires q", () => {
    expect(() => buildRetrieveBody({})).toThrow("retrieve requires --q");
  });
});

describe("retrieve --help", () => {
  test("documents flags and POST /v1/retrieve", async () => {
    const proc = Bun.spawn(["bun", "run", "src/index.ts", "retrieve", "--help"], {
      cwd: import.meta.dir + "/../..",
      stdout: "pipe",
      stderr: "pipe",
    });
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const code = await proc.exited;
    const text = `${stdout}\n${stderr}`;

    expect(code).toBe(0);
    expect(text).toContain("Usage: linkbolt-cli retrieve [options]");
    expect(text).toContain("--q");
    expect(text).toContain("--limit");
    expect(text).toContain("--platform");
    expect(text).toContain("--source-kind");
    expect(text).toContain("--since");
    expect(text).toContain("--json");
    expect(text).toContain("/v1/retrieve");
    expect(text).not.toMatch(/lbk_live_[A-Za-z0-9]+/);
  });
});
