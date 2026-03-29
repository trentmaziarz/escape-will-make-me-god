import type { ScannerPlugin, DiscoveredService } from "./scanner";
import { getAllServices } from "./services-db";

/**
 * Fallback scanner that returns all curated database services as
 * potential matches with low confidence. The user must confirm.
 */
export const databaseScanner: ScannerPlugin = {
  id: "database",
  name: "Curated Database",
  rateLimit: { maxPerMinute: 100 },

  async scan(): Promise<DiscoveredService[]> {
    return getAllServices().map((service) => ({
      serviceId: service.id,
      confidence: 0.2,
      source: "database",
    }));
  },
};
