// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { hibpScanner, _resetRateLimiter } from "@/lib/hibp";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  process.env.HIBP_API_KEY = "test-hibp-key";
  _resetRateLimiter();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function mockFetch(
  handler: (url: string, init?: RequestInit) => Promise<Response>
) {
  globalThis.fetch = vi.fn(handler) as typeof fetch;
}

describe("hibpScanner", () => {
  it("has correct plugin metadata", () => {
    expect(hibpScanner.id).toBe("hibp");
    expect(hibpScanner.name).toBe("Have I Been Pwned");
    expect(hibpScanner.rateLimit.maxPerMinute).toBe(10);
  });

  it("maps breaches to DiscoveredService[] on success", async () => {
    mockFetch(async () =>
      new Response(
        JSON.stringify([
          { Name: "Facebook", Title: "Facebook", Domain: "facebook.com", BreachDate: "2019-09-01", DataClasses: ["Email addresses"] },
          { Name: "LinkedIn", Title: "LinkedIn", Domain: "linkedin.com", BreachDate: "2012-05-05", DataClasses: ["Email addresses"] },
        ]),
        { status: 200 }
      )
    );

    const results = await hibpScanner.scan("test@example.com");

    expect(results).toHaveLength(2);
    expect(results).toContainEqual({
      serviceId: "facebook",
      confidence: 0.9,
      source: "hibp",
    });
    expect(results).toContainEqual({
      serviceId: "linkedin",
      confidence: 0.9,
      source: "hibp",
    });
  });

  it("skips breaches with no mapping in breach-to-service-map", async () => {
    mockFetch(async () =>
      new Response(
        JSON.stringify([
          { Name: "Facebook", Title: "Facebook", Domain: "facebook.com", BreachDate: "2019-09-01", DataClasses: [] },
          { Name: "SomeUnknownSite", Title: "Unknown", Domain: "unknown.com", BreachDate: "2020-01-01", DataClasses: [] },
        ]),
        { status: 200 }
      )
    );

    const results = await hibpScanner.scan("test@example.com");

    expect(results).toHaveLength(1);
    expect(results[0].serviceId).toBe("facebook");
  });

  it("returns empty array on 404 (no breaches found)", async () => {
    mockFetch(async () => new Response(null, { status: 404 }));

    const results = await hibpScanner.scan("clean@example.com");
    expect(results).toEqual([]);
  });

  it("throws on 401 (bad API key)", async () => {
    mockFetch(async () => new Response("Unauthorized", { status: 401 }));

    await expect(hibpScanner.scan("test@example.com")).rejects.toThrow(
      "HIBP API authentication failed"
    );
  });

  it("retries on 429 (rate limited) then succeeds", async () => {
    let callCount = 0;
    mockFetch(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response("Rate limited", {
          status: 429,
          headers: { "retry-after": "0" },
        });
      }
      return new Response(
        JSON.stringify([
          { Name: "Tumblr", Title: "Tumblr", Domain: "tumblr.com", BreachDate: "2013-01-01", DataClasses: [] },
        ]),
        { status: 200 }
      );
    });

    const results = await hibpScanner.scan("test@example.com");
    expect(callCount).toBe(2);
    expect(results).toHaveLength(1);
    expect(results[0].serviceId).toBe("tumblr");
  });

  it("throws after exhausting retries on persistent 429", async () => {
    mockFetch(async () =>
      new Response("Rate limited", {
        status: 429,
        headers: { "retry-after": "0" },
      })
    );

    await expect(hibpScanner.scan("test@example.com")).rejects.toThrow(
      "HIBP rate limit exceeded after retries"
    );
  });

  it("throws on network error", async () => {
    mockFetch(async () => {
      throw new Error("Network failure");
    });

    await expect(hibpScanner.scan("test@example.com")).rejects.toThrow(
      "Network failure"
    );
  });

  it("throws when HIBP_API_KEY is not set", async () => {
    delete process.env.HIBP_API_KEY;

    await expect(hibpScanner.scan("test@example.com")).rejects.toThrow(
      "HIBP_API_KEY is not configured"
    );
  });

  it("sends correct headers", async () => {
    mockFetch(async (_url, init) => {
      const headers = init?.headers as Record<string, string>;
      expect(headers["hibp-api-key"]).toBe("test-hibp-key");
      expect(headers["user-agent"]).toBe("deindex.me");
      return new Response("[]", { status: 200 });
    });

    await hibpScanner.scan("test@example.com");
    expect(globalThis.fetch).toHaveBeenCalledOnce();
  });

  it("encodes email in the URL", async () => {
    mockFetch(async (url) => {
      expect(url).toContain("test%2Bplus%40example.com");
      return new Response("[]", { status: 200 });
    });

    await hibpScanner.scan("test+plus@example.com");
  });

  it("never includes email in error messages", async () => {
    mockFetch(async () => new Response("Server Error", { status: 500 }));

    try {
      await hibpScanner.scan("secret@example.com");
    } catch (e) {
      const message = (e as Error).message;
      expect(message).not.toContain("secret@example.com");
    }
  });

  it("throws timeout error on AbortError", async () => {
    mockFetch(async (_url, init) => {
      // Simulate an AbortError (as thrown when AbortController fires)
      const err = new DOMException("The operation was aborted", "AbortError");
      throw err;
    });

    await expect(hibpScanner.scan("test@example.com")).rejects.toThrow(
      "HIBP API request timed out"
    );
  });

  it("handles non-standard error codes (e.g. 503)", async () => {
    mockFetch(async () => new Response("Service Unavailable", { status: 503 }));

    await expect(hibpScanner.scan("test@example.com")).rejects.toThrow(
      "HIBP API error: 503"
    );
  });

  it("queues requests when tokens exhausted and drains on refill", async () => {
    vi.useFakeTimers();
    _resetRateLimiter();

    mockFetch(async () => new Response("[]", { status: 200 }));

    // Exhaust all 10 tokens
    for (let i = 0; i < 10; i++) {
      await hibpScanner.scan("test@example.com");
    }

    // 11th request enters the waiting queue
    const queuedScan = hibpScanner.scan("test@example.com");

    // Advance past refill interval per token (60_000 / 10 = 6000ms)
    await vi.advanceTimersByTimeAsync(6001);

    const result = await queuedScan;
    expect(result).toEqual([]);
    expect(globalThis.fetch).toHaveBeenCalledTimes(11);

    vi.useRealTimers();
  });

  it("retries on 429 and uses retry-after header", async () => {
    let callCount = 0;
    mockFetch(async () => {
      callCount++;
      if (callCount <= 2) {
        return new Response("Rate limited", {
          status: 429,
          headers: { "retry-after": "0" },
        });
      }
      return new Response("[]", { status: 200 });
    });

    // retries=2, so first call + 2 retries = 3 total
    const results = await hibpScanner.scan("test@example.com");
    expect(callCount).toBe(3);
    expect(results).toEqual([]);
  });
});
