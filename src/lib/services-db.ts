import { z } from "zod/v4";
import type { ServiceEntry } from "@/data/services/schema";
import socialMediaData from "@/data/services/social-media.json";
import dataBrokersData from "@/data/services/data-brokers.json";

const serviceEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "ID must be kebab-case"),
  name: z.string().min(1),
  domain: z.string().min(1),
  category: z.enum([
    "social-media",
    "data-broker",
    "big-tech",
    "shopping",
    "ad-network",
    "other",
  ]),
  icon: z.string().min(1).max(4),
  hibpBreachNames: z.array(z.string()),
  deletionMethod: z.enum([
    "auto-api",
    "auto-email",
    "user-email",
    "manual-guide",
  ]),
  deletionDifficulty: z.enum(["auto", "easy", "medium", "hard"]),
  autoDeleteEndpoint: z.string().url().optional(),
  autoDeleteMethod: z.enum(["POST", "GET", "DELETE"]).optional(),
  autoDeletePayload: z.record(z.string(), z.string()).optional(),
  dpoEmail: z.string().email().optional(),
  deletionEmail: z.string().email().optional(),
  manualSteps: z.array(z.string()).optional(),
  deletionUrl: z.string().url().optional(),
  gdprApplicable: z.boolean(),
  ccpaApplicable: z.boolean(),
  templateOverride: z.string().optional(),
  expectedResponseDays: z.number().int().positive(),
  resistsRequests: z.boolean(),
  relistsAfterRemoval: z.boolean(),
  requiresIdentityVerification: z.boolean(),
  notes: z.string().optional(),
  lastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO date"),
});

function validateServices(data: unknown[], source: string): ServiceEntry[] {
  const results: ServiceEntry[] = [];
  for (let i = 0; i < data.length; i++) {
    const parsed = serviceEntrySchema.safeParse(data[i]);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw new Error(
        `Invalid service entry at ${source}[${i}]: ${issues}`
      );
    }
    results.push(parsed.data as ServiceEntry);
  }
  return results;
}

let _cache: ServiceEntry[] | null = null;

function loadAll(): ServiceEntry[] {
  if (_cache) return _cache;
  const social = validateServices(socialMediaData, "social-media.json");
  const brokers = validateServices(dataBrokersData, "data-brokers.json");
  _cache = [...social, ...brokers];

  const ids = new Set<string>();
  for (const entry of _cache) {
    if (ids.has(entry.id)) {
      throw new Error(`Duplicate service ID: ${entry.id}`);
    }
    ids.add(entry.id);
  }

  return _cache;
}

export function getAllServices(): ServiceEntry[] {
  return loadAll();
}

export function getServiceById(id: string): ServiceEntry | undefined {
  return loadAll().find((service) => service.id === id);
}

export function getServicesByCategory(
  category: ServiceEntry["category"]
): ServiceEntry[] {
  return loadAll().filter((service) => service.category === category);
}

export function searchServices(query: string): ServiceEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return loadAll().filter(
    (service) =>
      service.name.toLowerCase().includes(q) ||
      service.domain.toLowerCase().includes(q) ||
      service.category.toLowerCase().includes(q) ||
      service.id.toLowerCase().includes(q)
  );
}

/** Reset the cache — only for testing. */
export function _resetCache(): void {
  _cache = null;
}
