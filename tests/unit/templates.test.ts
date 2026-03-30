import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateGDPR } from "@/lib/email/deletion-requests/gdpr-template";
import { generateCCPA } from "@/lib/email/deletion-requests/ccpa-template";

const INPUT = {
  email: "test@example.com",
  phone: "+15550001234",
  serviceName: "TestService",
  dpoEmail: "dpo@testservice.com",
};

// --- GDPR Template ---

describe("generateGDPR", () => {
  it("contains Article 17 citation", () => {
    const { body } = generateGDPR(INPUT);
    expect(body).toContain("Article 17");
  });

  it("contains GDPR regulation reference", () => {
    const { body } = generateGDPR(INPUT);
    expect(body).toContain("General Data Protection Regulation");
    expect(body).toContain("(EU) 2016/679");
  });

  it("has correct subject line", () => {
    const { subject } = generateGDPR(INPUT);
    expect(subject).toBe("Right to Erasure Request — GDPR Article 17");
  });

  it("interpolates email correctly", () => {
    const { body } = generateGDPR(INPUT);
    expect(body).toContain("Email address: test@example.com");
    // Email also used as signature
    expect(body).toMatch(/Regards,\ntest@example\.com$/);
  });

  it("interpolates phone correctly", () => {
    const { body } = generateGDPR(INPUT);
    expect(body).toContain("Phone number: +15550001234");
  });

  it("has no raw {{placeholders}} in output", () => {
    const { subject, body } = generateGDPR(INPUT);
    expect(subject).not.toMatch(/\{\{.*?\}\}/);
    expect(body).not.toMatch(/\{\{.*?\}\}/);
  });

  it("mentions third-party notification (Article 17(2))", () => {
    const { body } = generateGDPR(INPUT);
    expect(body).toContain("Article 17(2)");
    expect(body).toContain("third parties");
  });

  it("mentions 30-day deadline", () => {
    const { body } = generateGDPR(INPUT);
    expect(body).toContain("30 days");
  });

  it("mentions supervisory authority complaint", () => {
    const { body } = generateGDPR(INPUT);
    expect(body).toContain("supervisory authority");
  });

  it("is plain text (no HTML tags)", () => {
    const { body } = generateGDPR(INPUT);
    expect(body).not.toMatch(/<[a-z][\s\S]*>/i);
  });
});

// --- CCPA Template ---

describe("generateCCPA", () => {
  it("contains Section 1798.105 citation", () => {
    const { body } = generateCCPA(INPUT);
    expect(body).toContain("Section 1798.105");
  });

  it("contains CCPA reference", () => {
    const { body } = generateCCPA(INPUT);
    expect(body).toContain("California Consumer Privacy Act");
  });

  it("has correct subject line", () => {
    const { subject } = generateCCPA(INPUT);
    expect(subject).toBe(
      "Right to Delete Request — California Consumer Privacy Act"
    );
  });

  it("interpolates email correctly", () => {
    const { body } = generateCCPA(INPUT);
    expect(body).toContain("Email address: test@example.com");
    expect(body).toMatch(/Regards,\ntest@example\.com$/);
  });

  it("interpolates phone correctly", () => {
    const { body } = generateCCPA(INPUT);
    expect(body).toContain("Phone number: +15550001234");
  });

  it("has no raw {{placeholders}} in output", () => {
    const { subject, body } = generateCCPA(INPUT);
    expect(subject).not.toMatch(/\{\{.*?\}\}/);
    expect(body).not.toMatch(/\{\{.*?\}\}/);
  });

  it("mentions 45-day deadline", () => {
    const { body } = generateCCPA(INPUT);
    expect(body).toContain("45 days");
  });

  it("mentions exception clause", () => {
    const { body } = generateCCPA(INPUT);
    expect(body).toContain("Section 1798.105(d)");
  });

  it("is plain text (no HTML tags)", () => {
    const { body } = generateCCPA(INPUT);
    expect(body).not.toMatch(/<[a-z][\s\S]*>/i);
  });
});

// --- Sender ---

import type { ServiceEntry } from "@/data/services/schema";

const mockSend = vi.fn().mockResolvedValue({ id: "mock-id" });

vi.mock("@/lib/email/resend", () => ({
  resend: { emails: { send: (...args: unknown[]) => mockSend(...args) } },
  FROM_DELETE: "delete@deindex.me",
}));

import {
  sendAutoEmail,
  generateUserDraft,
} from "@/lib/email/deletion-requests/sender";

function makeService(overrides: Partial<ServiceEntry> = {}): ServiceEntry {
  return {
    id: "test-service",
    name: "TestService",
    domain: "testservice.com",
    category: "social-media",
    icon: "TS",
    hibpBreachNames: [],
    deletionMethod: "auto-email",
    deletionDifficulty: "easy",
    dpoEmail: "dpo@testservice.com",
    gdprApplicable: true,
    ccpaApplicable: false,
    expectedResponseDays: 30,
    resistsRequests: false,
    relistsAfterRemoval: false,
    requiresIdentityVerification: false,
    lastVerified: "2026-01-01",
    ...overrides,
  };
}

describe("sendAutoEmail", () => {
  beforeEach(() => {
    mockSend.mockClear();
    mockSend.mockResolvedValue({ id: "mock-id" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends GDPR email to DPO with user CC'd", async () => {
    const service = makeService({ gdprApplicable: true, ccpaApplicable: false });
    await sendAutoEmail(service, "user@example.com", "+15550009999");

    expect(mockSend).toHaveBeenCalledOnce();
    const call = mockSend.mock.calls[0][0];
    expect(call.from).toBe("delete@deindex.me");
    expect(call.to).toBe("dpo@testservice.com");
    expect(call.cc).toBe("user@example.com");
    expect(call.subject).toContain("GDPR");
    expect(call.text).toContain("Article 17");
    expect(call.text).toContain("user@example.com");
  });

  it("sends CCPA email when service is CCPA-only", async () => {
    const service = makeService({
      gdprApplicable: false,
      ccpaApplicable: true,
    });
    await sendAutoEmail(service, "user@example.com", "+15550009999");

    const call = mockSend.mock.calls[0][0];
    expect(call.subject).toContain("California Consumer Privacy Act");
    expect(call.text).toContain("Section 1798.105");
  });

  it("falls back to deletionEmail when dpoEmail is missing", async () => {
    const service = makeService({
      dpoEmail: undefined,
      deletionEmail: "privacy@testservice.com",
    });
    await sendAutoEmail(service, "user@example.com", "+15550009999");

    const call = mockSend.mock.calls[0][0];
    expect(call.to).toBe("privacy@testservice.com");
  });

  it("throws when service has no contact email", async () => {
    const service = makeService({
      dpoEmail: undefined,
      deletionEmail: undefined,
    });
    await expect(
      sendAutoEmail(service, "user@example.com", "+15550009999")
    ).rejects.toThrow("no DPO or deletion email configured");
  });
});

describe("generateUserDraft", () => {
  it("returns pre-filled GDPR draft for GDPR service", () => {
    const service = makeService({ gdprApplicable: true });
    const draft = generateUserDraft(service, "user@example.com", "+15550009999");

    expect(draft.to).toBe("dpo@testservice.com");
    expect(draft.subject).toContain("GDPR");
    expect(draft.body).toContain("Article 17");
    expect(draft.body).toContain("user@example.com");
    expect(draft.body).toContain("+15550009999");
  });

  it("returns pre-filled CCPA draft for CCPA-only service", () => {
    const service = makeService({
      gdprApplicable: false,
      ccpaApplicable: true,
    });
    const draft = generateUserDraft(service, "user@example.com", "+15550009999");

    expect(draft.subject).toContain("California Consumer Privacy Act");
    expect(draft.body).toContain("Section 1798.105");
  });

  it("returns empty to when no contact email configured", () => {
    const service = makeService({
      dpoEmail: undefined,
      deletionEmail: undefined,
    });
    const draft = generateUserDraft(service, "user@example.com", "+15550009999");
    expect(draft.to).toBe("");
  });
});
