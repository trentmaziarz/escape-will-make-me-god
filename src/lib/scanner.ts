export interface DiscoveredService {
  serviceId: string;
  confidence: number; // 0.0–1.0
  source: string; // plugin ID that discovered it
}

export interface ScannerPlugin {
  id: string;
  name: string;
  scan(email: string, phone?: string): Promise<DiscoveredService[]>;
  rateLimit: { maxPerMinute: number };
}

/**
 * Runs all scanner plugins concurrently, merges results, deduplicates
 * by service ID (keeping the highest confidence), and returns sorted.
 */
export async function runScan(
  plugins: ScannerPlugin[],
  email: string,
  phone?: string
): Promise<DiscoveredService[]> {
  const results = await Promise.allSettled(
    plugins.map((plugin) => plugin.scan(email, phone))
  );

  const byServiceId = new Map<string, DiscoveredService>();

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const service of result.value) {
      const existing = byServiceId.get(service.serviceId);
      if (!existing || service.confidence > existing.confidence) {
        byServiceId.set(service.serviceId, service);
      }
    }
  }

  return Array.from(byServiceId.values()).sort(
    (a, b) => b.confidence - a.confidence
  );
}
