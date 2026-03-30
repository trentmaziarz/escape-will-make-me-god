import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  checkRateLimit,
  rateLimitResponse,
  _resetStore,
} from "@/lib/rate-limit";

beforeEach(() => {
  _resetStore();
});

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const result = checkRateLimit("initiate", "192.168.1.1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9); // 10 max, used 1
  });

  it("counts down remaining correctly", () => {
    for (let i = 0; i < 9; i++) {
      checkRateLimit("initiate", "192.168.1.1");
    }
    const result = checkRateLimit("initiate", "192.168.1.1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0); // 10/10 used
  });

  it("blocks when at the limit", () => {
    // Use all 10 initiate requests
    for (let i = 0; i < 10; i++) {
      checkRateLimit("initiate", "192.168.1.1");
    }
    const result = checkRateLimit("initiate", "192.168.1.1");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("enforces detonate limit of 20/hr", () => {
    for (let i = 0; i < 20; i++) {
      checkRateLimit("detonate", "10.0.0.1");
    }
    const result = checkRateLimit("detonate", "10.0.0.1");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks actions independently", () => {
    // Exhaust initiate
    for (let i = 0; i < 10; i++) {
      checkRateLimit("initiate", "192.168.1.1");
    }
    // scan should still work (separate action)
    const result = checkRateLimit("scan", "192.168.1.1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29);
  });

  it("tracks IPs independently", () => {
    // Exhaust limit for one IP
    for (let i = 0; i < 10; i++) {
      checkRateLimit("initiate", "192.168.1.1");
    }
    // Different IP should still work
    const result = checkRateLimit("initiate", "10.0.0.2");
    expect(result.allowed).toBe(true);
  });

  it("resets after the window expires", () => {
    // Use all requests
    for (let i = 0; i < 10; i++) {
      checkRateLimit("initiate", "192.168.1.1");
    }
    expect(checkRateLimit("initiate", "192.168.1.1").allowed).toBe(false);

    // Advance time past the 1hr window
    vi.useFakeTimers();
    vi.advanceTimersByTime(60 * 60 * 1000 + 1);

    const result = checkRateLimit("initiate", "192.168.1.1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);

    vi.useRealTimers();
  });

  it("returns a future resetAt timestamp", () => {
    const before = Date.now();
    const result = checkRateLimit("initiate", "192.168.1.1");
    expect(result.resetAt).toBeGreaterThan(before);
    expect(result.resetAt).toBeLessThanOrEqual(before + 60 * 60 * 1000 + 100);
  });

  it("hashes IPs — same IP always produces the same key", () => {
    checkRateLimit("initiate", "203.0.113.50");
    checkRateLimit("initiate", "203.0.113.50");
    const result = checkRateLimit("initiate", "203.0.113.50");
    // Count should be 3 (same hashed key)
    expect(result.remaining).toBe(7);
  });

  it("throws for unknown action", () => {
    expect(() => checkRateLimit("unknown", "192.168.1.1")).toThrow(
      "Unknown rate limit action"
    );
  });
});

describe("rateLimitResponse", () => {
  it("returns a 429 response", () => {
    const resetAt = Date.now() + 3600_000;
    const res = rateLimitResponse(resetAt);
    expect(res.status).toBe(429);
  });

  it("sets Retry-After header", () => {
    const resetAt = Date.now() + 3600_000;
    const res = rateLimitResponse(resetAt);
    const retryAfter = Number(res.headers.get("Retry-After"));
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(3600);
  });

  it("sets Content-Type to application/json", () => {
    const res = rateLimitResponse(Date.now() + 1000);
    expect(res.headers.get("Content-Type")).toBe("application/json");
  });

  it("ensures Retry-After is at least 1", () => {
    // resetAt in the past
    const res = rateLimitResponse(Date.now() - 1000);
    const retryAfter = Number(res.headers.get("Retry-After"));
    expect(retryAfter).toBe(1);
  });
});
