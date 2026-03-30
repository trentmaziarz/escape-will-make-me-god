import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createToken } from "@/lib/jwt";
import { resend, FROM_NOREPLY } from "@/lib/email/resend";
import {
  verificationHtml,
  verificationText,
} from "@/lib/email/templates/verification";

const InitiateSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().default(""),
  turnstileToken: z.string().min(1, "Turnstile token is required"),
});

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// SECURITY: The verification email prevents abuse — without it, anyone could
// enter someone else's email and trigger deletion requests on their behalf.
// The encrypted JWT in the link proves email ownership for the detonation step.
export async function POST(request: NextRequest) {
  // --- Parse & validate body ---
  let body: z.infer<typeof InitiateSchema>;
  try {
    const raw = await request.json();
    const result = InitiateSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: result.error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }
    body = result.data;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);

  // --- Rate limit ---
  const limit = checkRateLimit("initiate", ip);
  if (!limit.allowed) {
    return rateLimitResponse(limit.resetAt);
  }

  // --- Turnstile verification ---
  const turnstileOk = await verifyTurnstile(body.turnstileToken, ip);
  if (!turnstileOk) {
    return NextResponse.json(
      { error: "Bot verification failed" },
      { status: 403 }
    );
  }

  // --- Create encrypted JWT ---
  let token: string;
  try {
    token = await createToken(body.email, body.phone);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  // --- Build detonation URL ---
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://deindex.me";
  const detonateUrl = `${appUrl}/detonate?token=${encodeURIComponent(token)}`;

  // --- Send verification email ---
  try {
    await resend.emails.send({
      from: FROM_NOREPLY,
      to: body.email,
      subject: "DEINDEX.ME — Confirm Your Disappearance",
      html: verificationHtml({ detonateUrl }),
      text: verificationText({ detonateUrl }),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Check your email",
  });
}
