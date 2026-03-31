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
    mockSend.mockClear();
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

  it("lazily creates Resend client on first send()", async () => {
    process.env.RESEND_API_KEY = "test-api-key";
    const { resend } = await import("@/lib/email/resend");
    const { Resend } = await import("resend");
    (Resend as unknown as ReturnType<typeof vi.fn>).mockClear();

    await resend.emails.send({
      from: "test@test.com",
      to: "recipient@test.com",
      subject: "Test",
      text: "Body",
    });

    expect(Resend).toHaveBeenCalledOnce();
    expect(Resend).toHaveBeenCalledWith("test-api-key");
    expect(mockSend).toHaveBeenCalledOnce();
  });

  it("reuses Resend client on subsequent send() calls", async () => {
    process.env.RESEND_API_KEY = "test-api-key";
    const { resend } = await import("@/lib/email/resend");
    const { Resend } = await import("resend");
    (Resend as unknown as ReturnType<typeof vi.fn>).mockClear();

    await resend.emails.send({ from: "a@b.com", to: "c@d.com", subject: "1", text: "1" });
    await resend.emails.send({ from: "a@b.com", to: "c@d.com", subject: "2", text: "2" });

    expect(Resend).toHaveBeenCalledOnce();
    expect(mockSend).toHaveBeenCalledTimes(2);
  });
});
