import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/jwt";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import type { DiscoveredService } from "@/lib/scanner";
import { hibpScanner } from "@/lib/hibp";
import { databaseScanner } from "@/lib/database-scanner";
import { getServiceById } from "@/lib/services-db";

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

  let hibpError = false;

  const hibpServices: DiscoveredService[] = [];
  const dbServices: DiscoveredService[] = [];

  if (hibpResult.status === "fulfilled") {
    hibpServices.push(...hibpResult.value);
  } else {
    hibpError = true;
  }

  if (dbResult.status === "fulfilled") {
    dbServices.push(...dbResult.value);
  }

  // Confirmed = HIBP results (deduplicated by serviceId, highest confidence)
  const confirmedById = new Map<string, DiscoveredService>();
  for (const svc of hibpServices) {
    const existing = confirmedById.get(svc.serviceId);
    if (!existing || svc.confidence > existing.confidence) {
      confirmedById.set(svc.serviceId, svc);
    }
  }

  // Suggestions = DB results NOT already confirmed by HIBP
  const suggestions = dbServices.filter(
    (svc) => !confirmedById.has(svc.serviceId)
  );

  const services = [
    ...Array.from(confirmedById.values()),
    ...suggestions,
  ].sort((a, b) => b.confidence - a.confidence);

  // Enrich with service metadata for client display
  const enriched = services.map((svc) => {
    const entry = getServiceById(svc.serviceId);
    return {
      serviceId: svc.serviceId,
      confidence: svc.confidence,
      source: svc.source,
      name: entry?.name ?? svc.serviceId,
      icon: entry?.icon ?? "•",
      category: entry?.category ?? "other",
      deletionDifficulty: entry?.deletionDifficulty ?? "hard",
      deletionMethod: entry?.deletionMethod ?? "manual-guide",
    };
  });

  // Mask email for client display
  const [local, domain] = email.split("@");
  const maskedEmail =
    local && domain ? `${local.slice(0, 2)}***@${domain}` : "***@***";

  return NextResponse.json({
    services: enriched,
    scannedAt: new Date().toISOString(),
    maskedEmail,
    hibpError,
    ...(hibpError && {
      partial: true,
      note: "Breach database unavailable; results may be incomplete",
    }),
  });
}
