import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyTurnstile } from "@/lib/turnstile";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  process.env.TURNSTILE_SECRET_KEY = "test-secret-key";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("verifyTurnstile", () => {
  it("returns true on successful verification", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const result = await verifyTurnstile("valid-token", "192.168.1.1");
    expect(result).toBe(true);

    expect(globalThis.fetch).toHaveBeenCalledOnce();
    const [url, options] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toBe(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    );
    expect(options.method).toBe("POST");

    // Verify remoteip is passed
    const body = options.body as URLSearchParams;
    expect(body.get("remoteip")).toBe("192.168.1.1");
    expect(body.get("response")).toBe("valid-token");
    expect(body.get("secret")).toBe("test-secret-key");
  });

  it("returns false on failed verification", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ success: false, "error-codes": ["invalid-input-response"] }),
    });

    const result = await verifyTurnstile("bad-token", "192.168.1.1");
    expect(result).toBe(false);
  });

  it("returns false on network error (fail closed)", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await verifyTurnstile("some-token", "192.168.1.1");
    expect(result).toBe(false);
  });

  it("returns false on non-OK HTTP response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    const result = await verifyTurnstile("some-token", "192.168.1.1");
    expect(result).toBe(false);
  });

  it("returns false when TURNSTILE_SECRET_KEY is not set", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;

    const result = await verifyTurnstile("some-token", "192.168.1.1");
    expect(result).toBe(false);
    // fetch should never be called
    expect(globalThis.fetch).toBe(originalFetch);
  });

  it("returns false when response JSON is malformed", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error("invalid json")),
    });

    const result = await verifyTurnstile("some-token", "192.168.1.1");
    expect(result).toBe(false);
  });
});
