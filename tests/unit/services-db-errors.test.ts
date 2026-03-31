import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.resetModules();
});

describe("services-db validation errors", () => {
  it("throws on invalid service entry", async () => {
    vi.doMock("@/data/services/social-media.json", () => ({
      default: [{ id: "bad" }], // missing required fields
    }));
    vi.doMock("@/data/services/data-brokers.json", () => ({
      default: [],
    }));

    const { getAllServices, _resetCache } = await import("@/lib/services-db");
    _resetCache();
    expect(() => getAllServices()).toThrow(
      "Invalid service entry at social-media.json[0]"
    );
  });

  it("throws on duplicate service IDs across files", async () => {
    const entry = {
      id: "dup-test",
      name: "Service A",
      domain: "a.com",
      category: "social-media",
      icon: "A",
      hibpBreachNames: [],
      deletionMethod: "auto-email",
      deletionDifficulty: "easy",
      dpoEmail: "dpo@a.com",
      gdprApplicable: true,
      ccpaApplicable: false,
      expectedResponseDays: 30,
      resistsRequests: false,
      relistsAfterRemoval: false,
      requiresIdentityVerification: false,
      lastVerified: "2026-01-01",
    };

    vi.doMock("@/data/services/social-media.json", () => ({
      default: [entry],
    }));
    vi.doMock("@/data/services/data-brokers.json", () => ({
      default: [
        { ...entry, name: "Service B", domain: "b.com", category: "data-broker" },
      ],
    }));

    const { getAllServices, _resetCache } = await import("@/lib/services-db");
    _resetCache();
    expect(() => getAllServices()).toThrow("Duplicate service ID: dup-test");
  });
});
