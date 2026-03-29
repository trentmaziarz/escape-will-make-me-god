import { describe, it, expect, beforeEach } from "vitest";
import {
  getAllServices,
  getServiceById,
  getServicesByCategory,
  searchServices,
  _resetCache,
} from "@/lib/services-db";
import type { ServiceEntry } from "@/data/services/schema";
import socialMediaData from "@/data/services/social-media.json";
import dataBrokersData from "@/data/services/data-brokers.json";
import breachMap from "@/data/breach-to-service-map.json";

beforeEach(() => {
  _resetCache();
});

describe("JSON parsing", () => {
  it("social-media.json is a non-empty array", () => {
    expect(Array.isArray(socialMediaData)).toBe(true);
    expect(socialMediaData.length).toBeGreaterThan(0);
  });

  it("data-brokers.json is a non-empty array", () => {
    expect(Array.isArray(dataBrokersData)).toBe(true);
    expect(dataBrokersData.length).toBeGreaterThan(0);
  });

  it("breach-to-service-map.json is a non-empty object", () => {
    expect(typeof breachMap).toBe("object");
    expect(Object.keys(breachMap).length).toBeGreaterThan(0);
  });
});

describe("schema conformance", () => {
  it("all services pass Zod validation via getAllServices()", () => {
    expect(() => getAllServices()).not.toThrow();
  });

  it("loads exactly 10 social media + 10 data broker entries", () => {
    const all = getAllServices();
    expect(all.length).toBe(20);

    const social = all.filter((s) => s.category === "social-media");
    const brokers = all.filter((s) => s.category === "data-broker");
    expect(social.length).toBe(10);
    expect(brokers.length).toBe(10);
  });

  it("every entry has a unique kebab-case ID", () => {
    const all = getAllServices();
    const ids = all.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("every entry has a valid lastVerified ISO date", () => {
    for (const service of getAllServices()) {
      expect(service.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("every manual-guide entry has manualSteps and deletionUrl", () => {
    const manualGuides = getAllServices().filter(
      (s) => s.deletionMethod === "manual-guide"
    );
    expect(manualGuides.length).toBeGreaterThan(0);

    for (const service of manualGuides) {
      expect(service.manualSteps).toBeDefined();
      expect(service.manualSteps!.length).toBeGreaterThan(0);
      expect(service.deletionUrl).toBeDefined();
    }
  });

  it("every auto-email or user-email entry has a deletion or DPO email", () => {
    const emailServices = getAllServices().filter(
      (s) =>
        s.deletionMethod === "auto-email" || s.deletionMethod === "user-email"
    );
    expect(emailServices.length).toBeGreaterThan(0);

    for (const service of emailServices) {
      const hasEmail = service.deletionEmail || service.dpoEmail;
      expect(hasEmail).toBeTruthy();
    }
  });
});

describe("getServiceById", () => {
  it("returns a service by ID", () => {
    const fb = getServiceById("facebook");
    expect(fb).toBeDefined();
    expect(fb!.name).toBe("Facebook");
    expect(fb!.category).toBe("social-media");
  });

  it("returns undefined for unknown ID", () => {
    expect(getServiceById("nonexistent")).toBeUndefined();
  });
});

describe("getServicesByCategory", () => {
  it("returns only social-media entries", () => {
    const results = getServicesByCategory("social-media");
    expect(results.length).toBe(10);
    for (const s of results) {
      expect(s.category).toBe("social-media");
    }
  });

  it("returns only data-broker entries", () => {
    const results = getServicesByCategory("data-broker");
    expect(results.length).toBe(10);
    for (const s of results) {
      expect(s.category).toBe("data-broker");
    }
  });

  it("returns empty array for unused category", () => {
    const results = getServicesByCategory("ad-network");
    expect(results.length).toBe(0);
  });
});

describe("searchServices", () => {
  it("finds services by name", () => {
    const results = searchServices("Facebook");
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("facebook");
  });

  it("finds services by partial name (case-insensitive)", () => {
    const results = searchServices("face");
    expect(results.some((s) => s.id === "facebook")).toBe(true);
  });

  it("finds services by domain", () => {
    const results = searchServices("spokeo.com");
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("spokeo");
  });

  it("finds services by category keyword", () => {
    const results = searchServices("data-broker");
    expect(results.length).toBe(10);
  });

  it("returns empty array for empty query", () => {
    expect(searchServices("")).toEqual([]);
    expect(searchServices("  ")).toEqual([]);
  });

  it("returns empty array for no matches", () => {
    expect(searchServices("zzzzzznotaservice")).toEqual([]);
  });
});

describe("breach-to-service map", () => {
  it("every breach name maps to a valid service ID", () => {
    const allServices = getAllServices();
    const validIds = new Set(allServices.map((s) => s.id));

    for (const [breachName, serviceId] of Object.entries(breachMap)) {
      expect(validIds.has(serviceId)).toBe(true);
    }
  });

  it("every service with hibpBreachNames has matching map entries", () => {
    const map = breachMap as Record<string, string>;
    const servicesWithBreaches = getAllServices().filter(
      (s) => s.hibpBreachNames.length > 0
    );

    for (const service of servicesWithBreaches) {
      for (const breachName of service.hibpBreachNames) {
        expect(map[breachName]).toBe(service.id);
      }
    }
  });
});
