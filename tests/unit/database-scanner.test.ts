import { describe, it, expect } from "vitest";
import { databaseScanner } from "@/lib/database-scanner";
import { getAllServices } from "@/lib/services-db";

describe("databaseScanner", () => {
  it("has correct plugin metadata", () => {
    expect(databaseScanner.id).toBe("database");
    expect(databaseScanner.name).toBe("Curated Database");
    expect(databaseScanner.rateLimit.maxPerMinute).toBe(100);
  });

  it("returns all services from the curated database", async () => {
    const allServices = getAllServices();
    const results = await databaseScanner.scan("any@example.com");

    expect(results).toHaveLength(allServices.length);
  });

  it("sets confidence to 0.2 and source to 'database' for all results", async () => {
    const results = await databaseScanner.scan("any@example.com");

    for (const result of results) {
      expect(result.confidence).toBe(0.2);
      expect(result.source).toBe("database");
    }
  });

  it("maps service IDs correctly from the database", async () => {
    const allServices = getAllServices();
    const results = await databaseScanner.scan("any@example.com");

    const resultIds = results.map((r) => r.serviceId);
    const serviceIds = allServices.map((s) => s.id);

    expect(resultIds).toEqual(serviceIds);
  });

  it("ignores email and phone parameters", async () => {
    const results1 = await databaseScanner.scan("a@example.com");
    const results2 = await databaseScanner.scan("b@example.com", "+15550001234");

    expect(results1).toEqual(results2);
  });
});
