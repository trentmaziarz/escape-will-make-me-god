import { EncryptJWT, jwtDecrypt } from "jose";
import { createHash } from "crypto";

// SECURITY: We use encrypted JWTs (dir/A256GCM), not merely signed ones,
// because the payload contains PII (email, phone). Signing alone would
// expose these values in a base64-readable payload.
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  // dir/A256GCM requires exactly 256 bits (32 bytes).
  // SHA-256 the env var to guarantee correct length regardless of input.
  return createHash("sha256").update(secret).digest();
}

export interface DeindexPayload {
  email: string;
  phone: string;
  iat: number;
}

export async function createToken(
  email: string,
  phone: string
): Promise<string> {
  return new EncryptJWT({ email, phone })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .encrypt(getSecret());
}

export async function verifyToken(token: string): Promise<DeindexPayload> {
  const { payload } = await jwtDecrypt(token, getSecret());

  if (typeof payload.email !== "string" || !payload.email) {
    throw new Error("Token missing required field: email");
  }
  if (typeof payload.phone !== "string") {
    throw new Error("Token missing required field: phone");
  }

  return payload as unknown as DeindexPayload;
}
