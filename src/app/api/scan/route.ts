import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/jwt";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import type { DiscoveredService } from "@/lib/scanner";
import { hibpScanner } from "@/lib/hibp";
import { databaseScanner } from "@/lib/database-scanner";

const ScanSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  // --- Parse & validate body ---
  let body: z.infer<typeof ScanSchema>;
  try {
    const raw = await request.json();
    const result = ScanSchema.safeParse(raw);
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

  // --- Verify JWT ---
  let email: string;
  let phone: string;
  try {
    const payload = await verifyToken(body.token);
    email = payload.email;
    phone = payload.phone;
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  // --- Rate limit ---
  const ip = getClientIp(request);
  const limit = checkRateLimit("scan", ip);
  if (!limit.allowed) {
    return rateLimitResponse(limit.resetAt);
  }

  // --- Run HIBP + Database scanners in parallel ---
  const [hibpResult, dbResult] = await Promise.allSettled([
    hibpScanner.scan(email, phone),
    databaseScanner.scan(email, phone),
  ]);

  let partial = false;

  const allServices: DiscoveredService[] = [];

  if (hibpResult.status === "fulfilled") {
    allServices.push(...hibpResult.value);
  } else {
    partial = true;
  }

  if (dbResult.status === "fulfilled") {
    allServices.push(...dbResult.value);
  }

  // --- Deduplicate by serviceId, keep highest confidence ---
  const byServiceId = new Map<string, DiscoveredService>();
  for (const service of allServices) {
    const existing = byServiceId.get(service.serviceId);
    if (!existing || service.confidence > existing.confidence) {
      byServiceId.set(service.serviceId, service);
    }
  }

  const services = Array.from(byServiceId.values()).sort(
    (a, b) => b.confidence - a.confidence
  );

  return NextResponse.json({
    services,
    scannedAt: new Date().toISOString(),
    ...(partial && {
      partial: true,
      note: "Some sources were unavailable; results may be incomplete",
    }),
  });
}
