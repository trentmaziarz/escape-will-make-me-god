/**
 * In-memory counter for V1. In production, replace with Vercel KV
 * (`@vercel/kv`). This is the ONLY persistent integer in the system
 * per architecture principles.
 */

let count = 0;

export function getCount(): number {
  return count;
}

export function incrementCount(by: number): number {
  count += by;
  return count;
}

/** Reset counter — only for testing. */
export function _resetCount(): void {
  count = 0;
}
