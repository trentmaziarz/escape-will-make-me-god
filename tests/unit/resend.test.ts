import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the Resend constructor as a class
const mockSend = vi.fn().mockResolvedValue({ id: "msg_123" });
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function (this: { emails: { send: typeof mockSend } }) {
    this.emails = { send: mockSend };
  }),
}));

describe("resend client", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("exports FROM_NOREPLY with env override", async () => {
    process.env.RESEND_FROM_NOREPLY = "custom-noreply@test.com";
    const { FROM_NOREPLY } = await import("@/lib/email/resend");
    expect(FROM_NOREPLY).toBe("custom-noreply@test.com");
  });

  it("exports FROM_NOREPLY with default fallback", async () => {
    delete process.env.RESEND_FROM_NOREPLY;
    const { FROM_NOREPLY } = await import("@/lib/email/resend");
    expect(FROM_NOREPLY).toBe("noreply@deindex.me");
  });

  it("exports FROM_DELETE with env override", async () => {
    process.env.RESEND_FROM_DELETE = "custom-delete@test.com";
    const { FROM_DELETE } = await import("@/lib/email/resend");
    expect(FROM_DELETE).toBe("custom-delete@test.com");
  });

  it("exports FROM_DELETE with default fallback", async () => {
    delete process.env.RESEND_FROM_DELETE;
    const { FROM_DELETE } = await import("@/lib/email/resend");
    expect(FROM_DELETE).toBe("delete@deindex.me");
  });
});
