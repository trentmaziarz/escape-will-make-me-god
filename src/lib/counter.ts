/**
 * Public counter — the ONLY persistent integer in the system.
 *
 * Production: Upstash Redis (Vercel KV successor) via UPSTASH_REDIS_REST_URL.
 * Local dev:  In-memory fallback when Redis env vars are absent.
 */

import { Redis } from "@upstash/redis";

const COUNTER_KEY = "deletion_counter";

// ---------------------------------------------------------------------------
// Redis client (lazy — only created when env vars are present)
// ---------------------------------------------------------------------------

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// ---------------------------------------------------------------------------
// In-memory fallback (local dev / testing)
// ---------------------------------------------------------------------------

let memoryCount = 0;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getCount(): Promise<number> {
  const redis = getRedis();
  if (redis) {
    return (await redis.get<number>(COUNTER_KEY)) ?? 0;
  }
  return memoryCount;
}

export async function incrementCount(by: number): Promise<number> {
  const redis = getRedis();
  if (redis) {
    return redis.incrby(COUNTER_KEY, by);
  }
  memoryCount += by;
  return memoryCount;
}

/** Reset counter — testing only. */
export function _resetCount(): void {
  memoryCount = 0;
}
