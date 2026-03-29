// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import { createHash } from "crypto";
import { createToken, verifyToken } from "@/lib/jwt";

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-for-jwt-unit-tests";
});

function testSecret(): Uint8Array {
  return createHash("sha256").update("test-secret-for-jwt-unit-tests").digest();
}

describe("JWT", () => {
  it("roundtrips email and phone through create → verify", async () => {
    const token = await createToken("user@example.com", "+15550001234");
    const payload = await verifyToken(token);
    expect(payload.email).toBe("user@example.com");
    expect(payload.phone).toBe("+15550001234");
  });

  it("sets iat on the payload", async () => {
    const before = Math.floor(Date.now() / 1000);
    const token = await createToken("user@example.com", "+15550001234");
    const payload = await verifyToken(token);
    expect(payload.iat).toBeGreaterThanOrEqual(before);
    expect(payload.iat).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 1);
  });

  it("produces an encrypted token (5-part JWE, not readable)", async () => {
    const token = await createToken("user@example.com", "+15550001234");
    // JWE tokens have 5 dot-separated parts (vs 3 for JWS)
    const parts = token.split(".");
    expect(parts.length).toBe(5);
    // Payload should NOT be readable without decryption
    expect(token).not.toContain("user@example.com");
  });

  it("rejects an expired token", async () => {
    const { EncryptJWT } = await import("jose");
    const token = await new EncryptJWT({
      email: "user@example.com",
      phone: "+15550001234",
    })
      .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
      .setIssuedAt()
      .setExpirationTime(0)
      .encrypt(testSecret());

    await expect(verifyToken(token)).rejects.toThrow();
  });

  it("rejects a tampered token", async () => {
    const token = await createToken("user@example.com", "+15550001234");
    const parts = token.split(".");
    // Flip a character in the ciphertext (4th part of JWE)
    const ct = parts[3];
    parts[3] = (ct[0] === "A" ? "B" : "A") + ct.slice(1);
    const badToken = parts.join(".");

    await expect(verifyToken(badToken)).rejects.toThrow();
  });

  it("rejects a token missing email", async () => {
    const { EncryptJWT } = await import("jose");
    const token = await new EncryptJWT({ phone: "+15550001234" })
      .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .encrypt(testSecret());

    await expect(verifyToken(token)).rejects.toThrow("email");
  });

  it("rejects a token missing phone", async () => {
    const { EncryptJWT } = await import("jose");
    const token = await new EncryptJWT({ email: "user@example.com" })
      .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .encrypt(testSecret());

    await expect(verifyToken(token)).rejects.toThrow("phone");
  });

  it("rejects a completely invalid string", async () => {
    await expect(verifyToken("not-a-token")).rejects.toThrow();
  });
});
