// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { _resetStore } from "@/lib/rate-limit";

// --- Mocks ---

const mockHibpScan = vi.fn();
const mockDbScan = vi.fn();

vi.mock("@/lib/hibp", () => ({
  hibpScanner: {
    id: "hibp",
    name: "Have I Been Pwned",
    rateLimit: { maxPerMinute: 10 },
    scan: (...args: unknown[]) => mockHibpScan(...args),
  },
}));

vi.mock("@/lib/database-scanner", () => ({
  databaseScanner: {
    id: "database",
    name: "Curated Database",
    rateLimit: { maxPerMinute: 100 },
    scan: (...args: unknown[]) => mockDbScan(...args),
  },
}));

vi.mock("@/lib/jwt", () => ({
  verifyToken: vi.fn(),
}));

import { POST } from "@/app/api/scan/route";
import { verifyToken } from "@/lib/jwt";

const mockVerifyToken = vi.mocked(verifyToken);

function makeRequest(
  body: Record<string, unknown>,
  ip = "10.0.0.1"
): NextRequest {
  return new NextRequest("http://localhost:3000/api/scan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = { token: "valid-encrypted-token" };

const MOCK_PAYLOAD = {
  email: "test@example.com",
  phone: "+15550001234",
  iat: Math.floor(Date.now() / 1000),
};

const HIBP_RESULTS = [
  { serviceId: "facebook", confidence: 0.9, source: "hibp" },
  { serviceId: "linkedin", confidence: 0.9, source: "hibp" },
];

const DB_RESULTS = [
  { serviceId: "facebook", confidence: 0.2, source: "database" },
  { serviceId: "spokeo", confidence: 0.2, source: "database" },
  { serviceId: "whitepages", confidence: 0.2, source: "database" },
];

beforeEach(() => {
  process.env.JWT_SECRET = "test-jwt-secret-for-scan";
  mockHibpScan.mockClear();
  mockDbScan.mockClear();
  mockVerifyToken.mockReset();
  mockVerifyToken.mockResolvedValue(MOCK_PAYLOAD);
  mockHibpScan.mockResolvedValue(HIBP_RESULTS);
  mockDbScan.mockResolvedValue(DB_RESULTS);
  _resetStore();
});

afterEach(() => {
  vi.restoreAllMocks();
  _resetStore();
});

describe("POST /api/scan", () => {
  it("returns discovered services on valid token + HIBP breaches", async () => {
    const res = await POST(makeRequest(VALID_BODY));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.scannedAt).toBeTruthy();
    expect(data.partial).toBeUndefined();
    expect(data.hibpError).toBe(false);

    // HIBP results should override database for overlapping services
    const facebook = data.services.find(
      (s: { serviceId: string }) => s.serviceId === "facebook"
    );
    expect(facebook.confidence).toBe(0.9);
    expect(facebook.source).toBe("hibp");

    // Database-only services should be included
    const spokeo = data.services.find(
      (s: { serviceId: string }) => s.serviceId === "spokeo"
    );
    expect(spokeo.confidence).toBe(0.2);
    expect(spokeo.source).toBe("database");

    // Should be sorted by confidence descending
    const confidences = data.services.map(
      (s: { confidence: number }) => s.confidence
    );
    for (let i = 1; i < confidences.length; i++) {
      expect(confidences[i]).toBeLessThanOrEqual(confidences[i - 1]);
    }

    // Should have passed email and phone to scanners
    expect(mockHibpScan).toHaveBeenCalledWith(
      "test@example.com",
      "+15550001234"
    );
    expect(mockDbScan).toHaveBeenCalledWith(
      "test@example.com",
      "+15550001234"
    );
  });

  it("returns database suggestions when HIBP finds nothing", async () => {
    mockHibpScan.mockResolvedValue([]);

    const res = await POST(makeRequest(VALID_BODY));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.partial).toBeUndefined();
    expect(data.hibpError).toBe(false);
    expect(data.services).toHaveLength(DB_RESULTS.length);
    expect(
      data.services.every(
        (s: { source: string }) => s.source === "database"
      )
    ).toBe(true);
  });

  it("returns partial results with hibpError flag when HIBP fails", async () => {
    mockHibpScan.mockRejectedValue(new Error("HIBP API error"));

    const res = await POST(makeRequest(VALID_BODY));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.partial).toBe(true);
    expect(data.hibpError).toBe(true);
    expect(data.note).toContain("unavailable");
    expect(data.services).toHaveLength(DB_RESULTS.length);
    expect(
      data.services.every(
        (s: { source: string }) => s.source === "database"
      )
    ).toBe(true);
  });

  it("returns 401 for expired token", async () => {
    mockVerifyToken.mockRejectedValue(new Error("Token expired"));

    const res = await POST(makeRequest(VALID_BODY));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Invalid or expired token");
    expect(mockHibpScan).not.toHaveBeenCalled();
    expect(mockDbScan).not.toHaveBeenCalled();
  });

  it("returns 401 for invalid token", async () => {
    mockVerifyToken.mockRejectedValue(new Error("decryption failed"));

    const res = await POST(makeRequest({ token: "garbage-token" }));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Invalid or expired token");
    expect(mockHibpScan).not.toHaveBeenCalled();
  });

  it("returns 400 for missing token", async () => {
    const res = await POST(makeRequest({}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid input");
    expect(mockVerifyToken).not.toHaveBeenCalled();
  });

  it("returns 400 for empty token", async () => {
    const res = await POST(makeRequest({ token: "" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(mockVerifyToken).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited (6th request)", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await POST(makeRequest(VALID_BODY));
      expect(res.status).toBe(200);
    }

    const res = await POST(makeRequest(VALID_BODY));
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toBe("Too many requests");
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("deduplicates services keeping highest confidence", async () => {
    mockHibpScan.mockResolvedValue([
      { serviceId: "facebook", confidence: 0.9, source: "hibp" },
    ]);
    mockDbScan.mockResolvedValue([
      { serviceId: "facebook", confidence: 0.2, source: "database" },
    ]);

    const res = await POST(makeRequest(VALID_BODY));
    const data = await res.json();

    expect(data.services).toHaveLength(1);
    expect(data.services[0].confidence).toBe(0.9);
    expect(data.services[0].source).toBe("hibp");
  });

  it("excludes HIBP-confirmed services from database suggestions (no duplicates)", async () => {
    mockHibpScan.mockResolvedValue([
      { serviceId: "facebook", confidence: 0.9, source: "hibp" },
    ]);
    mockDbScan.mockResolvedValue([
      { serviceId: "facebook", confidence: 0.2, source: "database" },
      { serviceId: "spokeo", confidence: 0.2, source: "database" },
    ]);

    const res = await POST(makeRequest(VALID_BODY));
    const data = await res.json();

    // facebook should appear once with hibp source, not twice
    const facebookEntries = data.services.filter(
      (s: { serviceId: string }) => s.serviceId === "facebook"
    );
    expect(facebookEntries).toHaveLength(1);
    expect(facebookEntries[0].source).toBe("hibp");

    // spokeo should appear as a database suggestion
    const spokeo = data.services.find(
      (s: { serviceId: string }) => s.serviceId === "spokeo"
    );
    expect(spokeo.source).toBe("database");
  });

  it("never includes PII in error responses", async () => {
    mockVerifyToken.mockRejectedValue(
      new Error("decrypt failed for test@example.com")
    );

    const res = await POST(makeRequest(VALID_BODY));
    const data = await res.json();

    expect(JSON.stringify(data)).not.toContain("test@example.com");
  });
});
