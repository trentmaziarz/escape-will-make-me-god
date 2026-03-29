import type { ScannerPlugin, DiscoveredService } from "./scanner";
import breachMap from "@/data/breach-to-service-map.json";

const HIBP_API_BASE = "https://haveibeenpwned.com/api/v3";

interface HibpBreach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  DataClasses: string[];
}

// --- Rate limiter: token-bucket, 10 req/min ---

const BUCKET_CAPACITY = 10;
const REFILL_INTERVAL_MS = 60_000; // 1 minute

let tokens = BUCKET_CAPACITY;
let lastRefill = Date.now();
const waiting: Array<() => void> = [];

function refillTokens(): void {
  const now = Date.now();
  const elapsed = now - lastRefill;
  const refill = Math.floor((elapsed / REFILL_INTERVAL_MS) * BUCKET_CAPACITY);
  if (refill > 0) {
    tokens = Math.min(BUCKET_CAPACITY, tokens + refill);
    lastRefill = now;
  }
}

function drainQueue(): void {
  while (waiting.length > 0 && tokens > 0) {
    tokens--;
    const resolve = waiting.shift()!;
    resolve();
  }
}

async function acquireToken(): Promise<void> {
  refillTokens();
  if (tokens > 0) {
    tokens--;
    return;
  }
  // Wait for a token to become available
  return new Promise<void>((resolve) => {
    waiting.push(resolve);
    // Schedule a drain after refill interval
    setTimeout(() => {
      refillTokens();
      drainQueue();
    }, REFILL_INTERVAL_MS / BUCKET_CAPACITY);
  });
}

// --- HIBP fetch with retry ---

async function fetchBreaches(
  email: string,
  retries = 2
): Promise<HibpBreach[]> {
  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) throw new Error("HIBP_API_KEY is not configured");

  await acquireToken();

  const response = await fetch(
    `${HIBP_API_BASE}/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
    {
      headers: {
        "hibp-api-key": apiKey,
        "user-agent": "deindex.me",
      },
    }
  );

  if (response.status === 404) return [];

  if (response.status === 401) {
    throw new Error("HIBP API authentication failed");
  }

  if (response.status === 429) {
    if (retries <= 0) throw new Error("HIBP rate limit exceeded after retries");
    const retryAfter = Number(response.headers.get("retry-after")) || 2;
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return fetchBreaches(email, retries - 1);
  }

  if (!response.ok) {
    throw new Error(`HIBP API error: ${response.status}`);
  }

  return response.json();
}

// --- Breach → service mapping ---

function mapBreachesToServices(breaches: HibpBreach[]): DiscoveredService[] {
  const map = breachMap as Record<string, string>;
  const results: DiscoveredService[] = [];

  for (const breach of breaches) {
    const serviceId = map[breach.Name];
    if (serviceId) {
      results.push({
        serviceId,
        confidence: 0.9,
        source: "hibp",
      });
    }
    // Unknown breaches (no mapping) are silently skipped per spec
  }

  return results;
}

// --- ScannerPlugin implementation ---

export const hibpScanner: ScannerPlugin = {
  id: "hibp",
  name: "Have I Been Pwned",
  rateLimit: { maxPerMinute: 10 },

  async scan(email: string): Promise<DiscoveredService[]> {
    const breaches = await fetchBreaches(email);
    return mapBreachesToServices(breaches);
  },
};

/** Reset rate limiter — only for testing. */
export function _resetRateLimiter(): void {
  tokens = BUCKET_CAPACITY;
  lastRefill = Date.now();
  waiting.length = 0;
}
