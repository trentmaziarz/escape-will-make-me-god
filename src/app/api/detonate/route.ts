import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/jwt";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getServiceById } from "@/lib/services-db";
import {
  sendAutoEmail,
  generateUserDraft,
} from "@/lib/email/deletion-requests/sender";
import { generateReport } from "@/lib/pdf/report";
import type { ReportService } from "@/lib/pdf/report";
import { resend, FROM_NOREPLY } from "@/lib/email/resend";
import { incrementCount } from "@/lib/counter";
import type { ServiceEntry } from "@/data/services/schema";

const DetonateSchema = z.object({
  token: z.string().min(1, "Token is required"),
  selectedServiceIds: z.array(z.string()).min(1, "At least one service required"),
});

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

interface ServiceResult {
  serviceId: string;
  action: "auto-sent" | "user-draft" | "manual-guide";
  success: boolean;
  error?: string;
}

async function callAutoApi(
  service: ServiceEntry,
  email: string,
  phone: string
): Promise<void> {
  if (!service.autoDeleteEndpoint) {
    throw new Error(`Service "${service.name}" has no auto-delete endpoint`);
  }

  const method = service.autoDeleteMethod ?? "POST";
  const payload = service.autoDeletePayload
    ? Object.fromEntries(
        Object.entries(service.autoDeletePayload).map(([k, v]) => [
          k,
          v.replace("{{email}}", email).replace("{{phone}}", phone),
        ])
      )
    : undefined;

  const response = await fetch(service.autoDeleteEndpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined,
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
}

export async function POST(request: NextRequest) {
  // --- Parse & validate body ---
  let body: z.infer<typeof DetonateSchema>;
  try {
    const raw = await request.json();
    const result = DetonateSchema.safeParse(raw);
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
  const limit = checkRateLimit("detonate", ip);
  if (!limit.allowed) {
    return rateLimitResponse(limit.resetAt);
  }

  // --- Load selected services ---
  const services: ServiceEntry[] = [];
  for (const id of body.selectedServiceIds) {
    const svc = getServiceById(id);
    if (svc) services.push(svc);
  }

  if (services.length === 0) {
    return NextResponse.json(
      { error: "No valid services selected" },
      { status: 400 }
    );
  }

  // --- Process each service ---
  const results: ServiceResult[] = [];
  const reportServices: ReportService[] = [];

  // Separate services by deletion method
  const autoApiServices = services.filter((s) => s.deletionMethod === "auto-api");
  const autoEmailServices = services.filter((s) => s.deletionMethod === "auto-email");
  const userEmailServices = services.filter((s) => s.deletionMethod === "user-email");
  const manualServices = services.filter((s) => s.deletionMethod === "manual-guide");

  // Auto-API calls (parallel with error handling)
  const autoApiResults = await Promise.allSettled(
    autoApiServices.map((svc) => callAutoApi(svc, email, phone))
  );
  autoApiServices.forEach((svc, i) => {
    const result = autoApiResults[i];
    const success = result.status === "fulfilled";
    results.push({
      serviceId: svc.id,
      action: "auto-sent",
      success,
      ...(result.status === "rejected" && { error: "API call failed" }),
    });
    reportServices.push({
      name: svc.name,
      category: svc.category,
      action: "auto-sent",
      status: success ? "sent" : "pending-user",
    });
  });

  // Auto-email sends (parallel with error handling)
  const autoEmailResults = await Promise.allSettled(
    autoEmailServices.map((svc) => sendAutoEmail(svc, email, phone))
  );
  autoEmailServices.forEach((svc, i) => {
    const result = autoEmailResults[i];
    const success = result.status === "fulfilled";
    results.push({
      serviceId: svc.id,
      action: "auto-sent",
      success,
      ...(result.status === "rejected" && { error: "Email send failed" }),
    });
    reportServices.push({
      name: svc.name,
      category: svc.category,
      action: "auto-sent",
      status: success ? "sent" : "pending-user",
    });
  });

  // User-email drafts
  for (const svc of userEmailServices) {
    const draft = generateUserDraft(svc, email, phone);
    results.push({ serviceId: svc.id, action: "user-draft", success: true });
    reportServices.push({
      name: svc.name,
      category: svc.category,
      action: "user-draft",
      status: "pending-user",
      draftEmail: draft,
    });
  }

  // Manual guides
  for (const svc of manualServices) {
    results.push({ serviceId: svc.id, action: "manual-guide", success: true });
    reportServices.push({
      name: svc.name,
      category: svc.category,
      action: "manual-guide",
      status: "pending-user",
      manualSteps: svc.manualSteps ?? [],
    });
  }

  // --- Tally results ---
  const requestsSent = results.filter(
    (r) => r.action === "auto-sent" && r.success
  ).length;
  const guidesGenerated = results.filter(
    (r) => r.action === "user-draft" || r.action === "manual-guide"
  ).length;

  // --- Generate PDF report ---
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateReport({
      email,
      detonatedAt: new Date().toISOString(),
      services: reportServices,
      totalRequestsSent: requestsSent,
      totalGuidesGenerated: guidesGenerated,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }

  // --- Email PDF to user ---
  let reportEmailed = false;
  try {
    await resend.emails.send({
      from: FROM_NOREPLY,
      to: email,
      subject: "DEINDEX.ME — Your Detonation Report",
      text: "Your detonation report is attached. This PDF is your only record — we have deleted all your data.",
      attachments: [
        {
          filename: "deindex-report.pdf",
          content: pdfBuffer,
        },
      ],
    });
    reportEmailed = true;
  } catch {
    // Report email failed but we still return success for the deletions
  }

  // --- Increment counter ---
  if (requestsSent > 0) {
    await incrementCount(requestsSent);
  }

  return NextResponse.json({
    success: true,
    requestsSent,
    guidesGenerated,
    reportEmailed,
  });
}
