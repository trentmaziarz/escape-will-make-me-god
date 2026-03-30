// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { _resetStore } from "@/lib/rate-limit";
import { _resetCount, getCount } from "@/lib/counter";

// --- Mocks ---

const mockResendSend = vi.fn().mockResolvedValue({ id: "mock-id" });

vi.mock("@/lib/email/resend", () => ({
  resend: { emails: { send: (...args: unknown[]) => mockResendSend(...args) } },
  FROM_NOREPLY: "noreply@deindex.me",
  FROM_DELETE: "delete@deindex.me",
}));

vi.mock("@/lib/jwt", () => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/lib/pdf/report", () => ({
  generateReport: vi.fn().mockResolvedValue(Buffer.from("fake-pdf")),
}));

import { POST } from "@/app/api/detonate/route";
import { verifyToken } from "@/lib/jwt";
import { generateReport } from "@/lib/pdf/report";

const mockVerifyToken = vi.mocked(verifyToken);
const mockGenerateReport = vi.mocked(generateReport);

const MOCK_PAYLOAD = {
  email: "test@example.com",
  phone: "+15550001234",
  iat: Math.floor(Date.now() / 1000),
};

function makeRequest(
  body: Record<string, unknown>,
  ip = "10.0.0.1"
): NextRequest {
  return new NextRequest("http://localhost:3000/api/detonate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

// Service IDs from the curated database:
// auto-email: spokeo, whitepages, beenverified, acxiom, peoplefinder, intelius
// manual-guide: facebook, linkedin, instagram, reddit, radaris
// user-email: mylife

beforeEach(() => {
  process.env.JWT_SECRET = "test-jwt-secret-for-detonate";
  mockResendSend.mockClear();
  mockVerifyToken.mockReset();
  mockGenerateReport.mockReset();
  mockVerifyToken.mockResolvedValue(MOCK_PAYLOAD);
  mockGenerateReport.mockResolvedValue(Buffer.from("fake-pdf"));
  mockResendSend.mockResolvedValue({ id: "mock-id" });
  _resetStore();
  _resetCount();
});

afterEach(() => {
  vi.restoreAllMocks();
  _resetStore();
  _resetCount();
});

describe("POST /api/detonate", () => {
  it("sends deletion emails for auto-email services", async () => {
    // spokeo and whitepages are auto-email services in the database
    const res = await POST(
      makeRequest({
        token: "valid-token",
        selectedServiceIds: ["spokeo", "whitepages"],
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.requestsSent).toBe(2);
    expect(data.guidesGenerated).toBe(0);
    expect(data.reportEmailed).toBe(true);

    // 2 deletion emails + 1 report email = 3 calls
    expect(mockResendSend).toHaveBeenCalledTimes(3);

    // First two calls should be deletion emails from delete@
    const deletionCall1 = mockResendSend.mock.calls[0][0];
    expect(deletionCall1.from).toBe("delete@deindex.me");
    expect(deletionCall1.cc).toBe("test@example.com");

    // Last call should be report email from noreply@
    const reportCall = mockResendSend.mock.calls[2][0];
    expect(reportCall.from).toBe("noreply@deindex.me");
    expect(reportCall.to).toBe("test@example.com");
    expect(reportCall.attachments).toHaveLength(1);
    expect(reportCall.attachments[0].filename).toBe("deindex-report.pdf");
  });

  it("generates guides for manual-guide services", async () => {
    // reddit has deletionMethod: "manual-guide"
    const res = await POST(
      makeRequest({
        token: "valid-token",
        selectedServiceIds: ["reddit"],
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.requestsSent).toBe(0);
    expect(data.guidesGenerated).toBe(1);

    // Report should have been generated
    expect(mockGenerateReport).toHaveBeenCalledOnce();
  });

  it("handles mixed service types correctly", async () => {
    // spokeo (auto-email) + reddit (manual-guide)
    const res = await POST(
      makeRequest({
        token: "valid-token",
        selectedServiceIds: ["spokeo", "reddit"],
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.requestsSent).toBe(1);
    expect(data.guidesGenerated).toBe(1);

    // Report should include both types
    const reportData = mockGenerateReport.mock.calls[0][0];
    expect(reportData.services.length).toBe(2);
  });

  it("still sends report when some deletion emails fail", async () => {
    // First call (deletion email) fails, second (deletion email) succeeds,
    // third (report email) succeeds
    let callCount = 0;
    mockResendSend.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.reject(new Error("Send failed"));
      return Promise.resolve({ id: "mock-id" });
    });

    const res = await POST(
      makeRequest({
        token: "valid-token",
        selectedServiceIds: ["spokeo", "whitepages"],
      })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    // One succeeded, one failed
    expect(data.requestsSent).toBe(1);
    expect(data.reportEmailed).toBe(true);

    // Report should still have been generated with both services
    const reportData = mockGenerateReport.mock.calls[0][0];
    expect(reportData.services).toHaveLength(2);

    // Check statuses in report
    const sentService = reportData.services.find(
      (s: { status: string }) => s.status === "sent"
    );
    const failedService = reportData.services.find(
      (s: { status: string }) => s.status === "pending-user"
    );
    expect(sentService).toBeDefined();
    expect(failedService).toBeDefined();
  });

  it("returns 401 for expired token", async () => {
    mockVerifyToken.mockRejectedValue(new Error("Token expired"));

    const res = await POST(
      makeRequest({
        token: "expired-token",
        selectedServiceIds: ["spokeo"],
      })
    );
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Invalid or expired token");
    expect(mockResendSend).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited (3rd request)", async () => {
    // detonate limit is 2 per IP per hour
    for (let i = 0; i < 2; i++) {
      const res = await POST(
        makeRequest({
          token: "valid-token",
          selectedServiceIds: ["spokeo"],
        })
      );
      expect(res.status).toBe(200);
    }

    const res = await POST(
      makeRequest({
        token: "valid-token",
        selectedServiceIds: ["spokeo"],
      })
    );
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toBe("Too many requests");
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("increments counter by number of successful requests", async () => {
    expect(await getCount()).toBe(0);

    await POST(
      makeRequest({
        token: "valid-token",
        selectedServiceIds: ["spokeo", "whitepages"],
      })
    );

    expect(await getCount()).toBe(2);

    // Second detonation adds more
    await POST(
      makeRequest({
        token: "valid-token",
        selectedServiceIds: ["beenverified"],
      })
    );

    expect(await getCount()).toBe(3);
  });

  it("returns 400 for missing token", async () => {
    const res = await POST(
      makeRequest({ selectedServiceIds: ["spokeo"] })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty service list", async () => {
    const res = await POST(
      makeRequest({ token: "valid-token", selectedServiceIds: [] })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid service IDs (none found in DB)", async () => {
    const res = await POST(
      makeRequest({
        token: "valid-token",
        selectedServiceIds: ["nonexistent-service"],
      })
    );
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("No valid services selected");
  });

  it("never includes PII in error responses", async () => {
    mockVerifyToken.mockRejectedValue(
      new Error("decrypt failed for test@example.com")
    );

    const res = await POST(
      makeRequest({
        token: "bad-token",
        selectedServiceIds: ["spokeo"],
      })
    );
    const data = await res.json();

    expect(JSON.stringify(data)).not.toContain("test@example.com");
  });
});
