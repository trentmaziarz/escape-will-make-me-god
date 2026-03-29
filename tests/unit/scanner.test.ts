import { describe, it, expect } from "vitest";
import {
  runScan,
  type ScannerPlugin,
  type DiscoveredService,
} from "@/lib/scanner";

function makePlugin(
  id: string,
  results: DiscoveredService[] | Error
): ScannerPlugin {
  return {
    id,
    name: id,
    rateLimit: { maxPerMinute: 100 },
    scan: async () => {
      if (results instanceof Error) throw results;
      return results;
    },
  };
}

describe("runScan", () => {
  it("merges results from multiple plugins", async () => {
    const pluginA = makePlugin("a", [
      { serviceId: "facebook", confidence: 0.9, source: "a" },
    ]);
    const pluginB = makePlugin("b", [
      { serviceId: "spokeo", confidence: 0.8, source: "b" },
    ]);

    const results = await runScan([pluginA, pluginB], "test@example.com");
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.serviceId)).toContain("facebook");
    expect(results.map((r) => r.serviceId)).toContain("spokeo");
  });

  it("deduplicates by service ID keeping highest confidence", async () => {
    const pluginA = makePlugin("a", [
      { serviceId: "facebook", confidence: 0.9, source: "a" },
    ]);
    const pluginB = makePlugin("b", [
      { serviceId: "facebook", confidence: 0.2, source: "b" },
    ]);

    const results = await runScan([pluginA, pluginB], "test@example.com");
    expect(results).toHaveLength(1);
    expect(results[0].confidence).toBe(0.9);
    expect(results[0].source).toBe("a");
  });

  it("keeps lower-source entry if it has higher confidence", async () => {
    const pluginA = makePlugin("a", [
      { serviceId: "reddit", confidence: 0.3, source: "a" },
    ]);
    const pluginB = makePlugin("b", [
      { serviceId: "reddit", confidence: 0.7, source: "b" },
    ]);

    const results = await runScan([pluginA, pluginB], "test@example.com");
    expect(results).toHaveLength(1);
    expect(results[0].confidence).toBe(0.7);
    expect(results[0].source).toBe("b");
  });

  it("sorts results by confidence descending", async () => {
    const plugin = makePlugin("a", [
      { serviceId: "low", confidence: 0.2, source: "a" },
      { serviceId: "high", confidence: 0.95, source: "a" },
      { serviceId: "mid", confidence: 0.5, source: "a" },
    ]);

    const results = await runScan([plugin], "test@example.com");
    expect(results[0].serviceId).toBe("high");
    expect(results[1].serviceId).toBe("mid");
    expect(results[2].serviceId).toBe("low");
  });

  it("handles plugin failure gracefully (partial results)", async () => {
    const good = makePlugin("good", [
      { serviceId: "facebook", confidence: 0.9, source: "good" },
    ]);
    const bad = makePlugin("bad", new Error("Plugin crashed"));

    const results = await runScan([good, bad], "test@example.com");
    expect(results).toHaveLength(1);
    expect(results[0].serviceId).toBe("facebook");
  });

  it("returns empty array when all plugins fail", async () => {
    const bad1 = makePlugin("bad1", new Error("fail 1"));
    const bad2 = makePlugin("bad2", new Error("fail 2"));

    const results = await runScan([bad1, bad2], "test@example.com");
    expect(results).toEqual([]);
  });

  it("returns empty array when no plugins provided", async () => {
    const results = await runScan([], "test@example.com");
    expect(results).toEqual([]);
  });

  it("returns empty array when plugins return no results", async () => {
    const empty = makePlugin("empty", []);
    const results = await runScan([empty], "test@example.com");
    expect(results).toEqual([]);
  });

  it("passes email and phone to plugins", async () => {
    let receivedEmail = "";
    let receivedPhone = "";

    const spy: ScannerPlugin = {
      id: "spy",
      name: "spy",
      rateLimit: { maxPerMinute: 100 },
      scan: async (email, phone) => {
        receivedEmail = email;
        receivedPhone = phone ?? "";
        return [];
      },
    };

    await runScan([spy], "user@test.com", "+15550001234");
    expect(receivedEmail).toBe("user@test.com");
    expect(receivedPhone).toBe("+15550001234");
  });
});
