// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { _resetStore } from "@/lib/rate-limit";

// --- Mocks (must be before imports that use them) ---

const mockSend = vi.fn().mockResolvedValue({ id: "mock-email-id" });

vi.mock("@/lib/email/resend", () => ({
  resend: { emails: { send: (...args: unknown[]) => mockSend(...args) } },
  FROM_NOREPLY: "noreply@deindex.me",
}));

vi.mock("@/lib/turnstile", () => ({
  verifyTurnstile: vi.fn(),
}));

import { POST } from "@/app/api/initiate/route";
import { verifyTurnstile } from "@/lib/turnstile";
import { verifyToken } from "@/lib/jwt";

const mockTurnstile = vi.mocked(verifyTurnstile);

function makeRequest(body: Record<string, unknown>, ip = "1.2.3.4"): NextRequest {
  return new NextRequest("http://localhost:3000/api/initiate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  email: "test@example.com",
  phone: "+15550001234",
  turnstileToken: "valid-token",
};

beforeEach(() => {
  process.env.JWT_SECRET = "test-jwt-secret-for-integration";
  process.env.NEXT_PUBLIC_APP_URL = "https://deindex.me";
  mockSend.mockClear();
  mockTurnstile.mockReset();
  mockTurnstile.mockResolvedValue(true);
  mockSend.mockResolvedValue({ id: "mock-email-id" });
  _resetStore();
});

afterEach(() => {
  vi.restoreAllMocks();
  _resetStore();
});

describe("POST /api/initiate", () => {
  it("returns 200 and sends email on valid submission", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("Check your email");
    expect(mockSend).toHaveBeenCalledOnce();

    // Verify email was sent to the correct address from noreply@
    const sendCall = mockSend.mock.calls[0][0];
    expect(sendCall.to).toBe("test@example.com");
    expect(sendCall.from).toBe("noreply@deindex.me");
    expect(sendCall.subject).toContain("DEINDEX.ME");
    expect(sendCall.html).toContain("CONFIRM YOUR DISAPPEARANCE");
    expect(sendCall.text).toContain("deindex.me");
  });

  it("includes a valid JWT in the detonation URL", async () => {
    await POST(makeRequest(VALID_BODY));

    const sendCall = mockSend.mock.calls[0][0];
    const html: string = sendCall.html;

    // Extract token from the URL in the email HTML
    const urlMatch = html.match(/href="([^"]+\/detonate\?token=[^"]+)"/);
    expect(urlMatch).not.toBeNull();

    const url = new URL(urlMatch![1]);
    const token = url.searchParams.get("token")!;
    expect(token).toBeTruthy();

    // Verify the JWT decodes to the correct payload
    const payload = await verifyToken(token);
    expect(payload.email).toBe("test@example.com");
    expect(payload.phone).toBe("+15550001234");
    expect(payload.iat).toBeTypeOf("number");
  });

  it("accepts submission with optional phone omitted", async () => {
    const res = await POST(
      makeRequest({
        email: "test@example.com",
        turnstileToken: "valid-token",
      })
    );

    expect(res.status).toBe(200);

    // Verify JWT has empty phone
    const sendCall = mockSend.mock.calls[0][0];
    const urlMatch = sendCall.html.match(/href="([^"]+\/detonate\?token=[^"]+)"/);
    const url = new URL(urlMatch![1]);
    const payload = await verifyToken(url.searchParams.get("token")!);
    expect(payload.phone).toBe("");
  });

  it("returns 400 for invalid email", async () => {
    const res = await POST(
      makeRequest({ ...VALID_BODY, email: "not-an-email" })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 400 for missing email", async () => {
    const res = await POST(
      makeRequest({ turnstileToken: "valid-token" })
    );

    expect(res.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 400 for missing Turnstile token", async () => {
    const res = await POST(
      makeRequest({ email: "test@example.com" })
    );

    expect(res.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 400 for empty Turnstile token", async () => {
    const res = await POST(
      makeRequest({ ...VALID_BODY, turnstileToken: "" })
    );

    expect(res.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 403 when Turnstile verification fails", async () => {
    mockTurnstile.mockResolvedValue(false);

    const res = await POST(makeRequest(VALID_BODY));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Bot verification failed");
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited (6th request)", async () => {
    // First 5 requests succeed
    for (let i = 0; i < 5; i++) {
      const res = await POST(makeRequest(VALID_BODY));
      expect(res.status).toBe(200);
    }

    // 6th request should be rate limited
    const res = await POST(makeRequest(VALID_BODY));
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toBe("Too many requests");
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("rate limits per IP independently", async () => {
    // Use up limit for IP 1.2.3.4
    for (let i = 0; i < 5; i++) {
      await POST(makeRequest(VALID_BODY, "1.2.3.4"));
    }

    // Different IP should still work
    const res = await POST(makeRequest(VALID_BODY, "5.6.7.8"));
    expect(res.status).toBe(200);
  });

  it("returns 500 when email sending fails", async () => {
    mockSend.mockRejectedValue(new Error("Resend API error"));

    const res = await POST(makeRequest(VALID_BODY));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Failed to send verification email");
  });

  it("never includes PII in error responses", async () => {
    // Trigger various errors and check no PII leaks
    const invalidRes = await POST(
      makeRequest({ ...VALID_BODY, email: "secret@gmail.com", turnstileToken: "" })
    );
    const invalidData = await invalidRes.json();
    expect(JSON.stringify(invalidData)).not.toContain("secret@gmail.com");

    mockTurnstile.mockResolvedValue(false);
    const forbiddenRes = await POST(
      makeRequest({ ...VALID_BODY, email: "hidden@test.com" })
    );
    const forbiddenData = await forbiddenRes.json();
    expect(JSON.stringify(forbiddenData)).not.toContain("hidden@test.com");
  });
});
