/**
 * HTML + plain-text detonation report email.
 *
 * Used as a fallback when the PDF attachment route fails (e.g. serverless
 * environment limitations) and as the primary HTML body alongside the PDF.
 * Contains the same content as the PDF: summary, auto-sent services,
 * user-draft emails, manual guides, and legal deadlines.
 */

import type { ReportData, ReportService } from "@/lib/pdf/report";

function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***";
  return `${local.slice(0, 2)}***@${domain}`;
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function autoSentSection(services: ReportService[]): string {
  const rows = services
    .map(
      (svc) => `
            <tr>
              <td style="padding:6px 0;font-family:'Courier New',Courier,monospace;font-size:12px;color:#e8e4de;border-bottom:1px solid #2a2a2a;">${esc(svc.name)}</td>
              <td style="padding:6px 0;font-family:'Courier New',Courier,monospace;font-size:11px;color:#888888;border-bottom:1px solid #2a2a2a;">${esc(svc.category)}</td>
              <td align="right" style="padding:6px 0;font-family:'Courier New',Courier,monospace;font-size:11px;font-weight:700;color:#4ade80;border-bottom:1px solid #2a2a2a;">REQUEST SENT</td>
            </tr>`
    )
    .join("");

  return `
        <tr><td style="padding-bottom:16px;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#e8e4de;">Auto-Sent Deletion Requests</span>
        </td></tr>
        <tr><td style="padding-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">${rows}
          </table>
        </td></tr>
        <tr><td style="padding-bottom:24px;"><hr style="border:none;border-top:1px solid #2a2a2a;"></td></tr>`;
}

function userDraftSection(services: ReportService[]): string {
  const blocks = services
    .map((svc) => {
      const draft = svc.draftEmail;
      return `
            <tr><td style="padding:16px;background:#111111;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding-bottom:12px;font-family:'Courier New',Courier,monospace;font-size:14px;font-weight:700;color:#e8e4de;">${esc(svc.name)}</td></tr>
                <tr><td style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#888888;letter-spacing:2px;text-transform:uppercase;">TO</td></tr>
                <tr><td style="padding-bottom:12px;font-family:'Courier New',Courier,monospace;font-size:12px;color:#e8e4de;">${esc(draft?.to ?? "")}</td></tr>
                <tr><td style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#888888;letter-spacing:2px;text-transform:uppercase;">SUBJECT</td></tr>
                <tr><td style="padding-bottom:12px;font-family:'Courier New',Courier,monospace;font-size:12px;color:#e8e4de;">${esc(draft?.subject ?? "")}</td></tr>
                <tr><td style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#888888;letter-spacing:2px;text-transform:uppercase;">BODY</td></tr>
                <tr><td style="font-family:'Courier New',Courier,monospace;font-size:11px;color:#888888;line-height:1.6;white-space:pre-wrap;">${esc(draft?.body ?? "")}</td></tr>
              </table>
            </td></tr>
            <tr><td style="height:12px;"></td></tr>`;
    })
    .join("");

  return `
        <tr><td style="padding-bottom:16px;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#e8e4de;">Emails You Need to Send</span>
        </td></tr>
        <tr><td style="padding-bottom:8px;font-family:'Courier New',Courier,monospace;font-size:12px;color:#888888;line-height:1.6;">
          Copy and paste each email below. Send from the email address you used with DEINDEX.ME.
        </td></tr>
        <tr><td style="padding-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">${blocks}
          </table>
        </td></tr>
        <tr><td style="padding-bottom:24px;"><hr style="border:none;border-top:1px solid #2a2a2a;"></td></tr>`;
}

function manualGuideSection(services: ReportService[]): string {
  const blocks = services
    .map((svc) => {
      const steps = (svc.manualSteps ?? [])
        .map(
          (step, i) => `
                <tr>
                  <td valign="top" style="padding:2px 8px 2px 0;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:700;color:#c41e1e;width:24px;">${i + 1}.</td>
                  <td style="padding:2px 0;font-family:'Courier New',Courier,monospace;font-size:12px;color:#e8e4de;">${esc(step)}</td>
                </tr>`
        )
        .join("");

      return `
            <tr><td style="padding-bottom:8px;font-family:'Courier New',Courier,monospace;font-size:14px;font-weight:700;color:#e8e4de;">${esc(svc.name)}</td></tr>
            <tr><td style="padding-bottom:16px;">
              <table cellpadding="0" cellspacing="0" style="padding-left:8px;">${steps}
              </table>
            </td></tr>`;
    })
    .join("");

  return `
        <tr><td style="padding-bottom:16px;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#e8e4de;">Manual Deletion Guides</span>
        </td></tr>
        <tr><td style="padding-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">${blocks}
          </table>
        </td></tr>
        <tr><td style="padding-bottom:24px;"><hr style="border:none;border-top:1px solid #2a2a2a;"></td></tr>`;
}

export function reportHtml(data: ReportData): string {
  const autoSent = data.services.filter((s) => s.action === "auto-sent");
  const userDrafts = data.services.filter((s) => s.action === "user-draft");
  const manualGuides = data.services.filter(
    (s) => s.action === "manual-guide"
  );

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e8e4de;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
    <tr><td align="center" style="padding:48px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:8px;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:900;color:#e8e4de;letter-spacing:-1px;">
            DEINDEX<span style="color:#c41e1e;">.ME</span>
          </span>
        </td></tr>

        <!-- Subtitle -->
        <tr><td style="padding-bottom:24px;">
          <span style="font-family:'Courier New',Courier,monospace;font-size:11px;color:#888888;letter-spacing:3px;text-transform:uppercase;">
            DETONATION REPORT
          </span>
        </td></tr>

        <!-- Meta -->
        <tr><td style="padding-bottom:4px;font-family:'Courier New',Courier,monospace;font-size:12px;color:#888888;">
          Date: ${esc(data.detonatedAt)}
        </td></tr>
        <tr><td style="padding-bottom:16px;font-family:'Courier New',Courier,monospace;font-size:12px;color:#888888;">
          Email: ${esc(redactEmail(data.email))}
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding-bottom:24px;"><hr style="border:none;border-top:1px solid #2a2a2a;"></td></tr>

        <!-- Summary -->
        <tr><td style="padding-bottom:16px;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#e8e4de;">Summary</span>
        </td></tr>
        <tr><td style="padding-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:8px 0;font-family:'Courier New',Courier,monospace;font-size:13px;color:#888888;">Deletion requests sent</td>
              <td align="right" style="padding:8px 0;font-family:'Courier New',Courier,monospace;font-size:13px;font-weight:700;color:#e8e4de;">${data.totalRequestsSent}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-family:'Courier New',Courier,monospace;font-size:13px;color:#888888;">Guides requiring your action</td>
              <td align="right" style="padding:8px 0;font-family:'Courier New',Courier,monospace;font-size:13px;font-weight:700;color:#e8e4de;">${data.totalGuidesGenerated}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-family:'Courier New',Courier,monospace;font-size:13px;color:#888888;">Total services targeted</td>
              <td align="right" style="padding:8px 0;font-family:'Courier New',Courier,monospace;font-size:13px;font-weight:700;color:#e8e4de;">${data.services.length}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding-bottom:24px;"><hr style="border:none;border-top:1px solid #2a2a2a;"></td></tr>

${autoSent.length > 0 ? autoSentSection(autoSent) : ""}
${userDrafts.length > 0 ? userDraftSection(userDrafts) : ""}
${manualGuides.length > 0 ? manualGuideSection(manualGuides) : ""}

        <!-- Legal Deadlines -->
        <tr><td style="padding-bottom:16px;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;color:#e8e4de;">Legal Deadlines</span>
        </td></tr>
        <tr><td style="padding-bottom:8px;font-family:'Courier New',Courier,monospace;font-size:12px;line-height:1.6;color:#888888;">
          <strong style="color:#e8e4de;">GDPR (EU):</strong> Companies must respond within 30 days of receipt.
        </td></tr>
        <tr><td style="padding-bottom:8px;font-family:'Courier New',Courier,monospace;font-size:12px;line-height:1.6;color:#888888;">
          <strong style="color:#e8e4de;">CCPA (California):</strong> Companies must respond within 45 days of receipt.
        </td></tr>
        <tr><td style="padding-bottom:24px;font-family:'Courier New',Courier,monospace;font-size:12px;line-height:1.6;color:#888888;">
          If a company does not respond within the deadline, you may file a complaint with the relevant supervisory authority (GDPR) or the California Attorney General (CCPA).
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding-bottom:24px;"><hr style="border:none;border-top:1px solid #2a2a2a;"></td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-bottom:8px;font-family:'Courier New',Courier,monospace;font-size:10px;color:#555555;">
          DEINDEX.ME &mdash; We have deleted all data associated with this session.
        </td></tr>
        <tr><td align="center" style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#555555;">
          Free, open-source. No accounts. No stored data.
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function reportText(data: ReportData): string {
  const lines: string[] = [
    "DEINDEX.ME — DETONATION REPORT",
    "",
    `Date: ${data.detonatedAt}`,
    `Email: ${redactEmail(data.email)}`,
    "",
    "=".repeat(50),
    "",
    "SUMMARY",
    `Deletion requests sent: ${data.totalRequestsSent}`,
    `Guides requiring your action: ${data.totalGuidesGenerated}`,
    `Total services targeted: ${data.services.length}`,
    "",
    "=".repeat(50),
  ];

  const autoSent = data.services.filter((s) => s.action === "auto-sent");
  if (autoSent.length > 0) {
    lines.push("", "AUTO-SENT DELETION REQUESTS", "");
    for (const svc of autoSent) {
      lines.push(`  ${svc.name} (${svc.category}) — REQUEST SENT`);
    }
    lines.push("", "=".repeat(50));
  }

  const userDrafts = data.services.filter((s) => s.action === "user-draft");
  if (userDrafts.length > 0) {
    lines.push("", "EMAILS YOU NEED TO SEND", "");
    lines.push(
      "Copy and paste each email below. Send from the email address you used with DEINDEX.ME.",
      ""
    );
    for (const svc of userDrafts) {
      lines.push(`--- ${svc.name} ---`);
      lines.push(`To: ${svc.draftEmail?.to ?? ""}`);
      lines.push(`Subject: ${svc.draftEmail?.subject ?? ""}`);
      lines.push("");
      lines.push(svc.draftEmail?.body ?? "");
      lines.push("");
    }
    lines.push("=".repeat(50));
  }

  const manualGuides = data.services.filter(
    (s) => s.action === "manual-guide"
  );
  if (manualGuides.length > 0) {
    lines.push("", "MANUAL DELETION GUIDES", "");
    for (const svc of manualGuides) {
      lines.push(`--- ${svc.name} ---`);
      for (const [i, step] of (svc.manualSteps ?? []).entries()) {
        lines.push(`  ${i + 1}. ${step}`);
      }
      lines.push("");
    }
    lines.push("=".repeat(50));
  }

  lines.push(
    "",
    "LEGAL DEADLINES",
    "",
    "GDPR (EU): Companies must respond within 30 days of receipt.",
    "CCPA (California): Companies must respond within 45 days of receipt.",
    "",
    "If a company does not respond within the deadline, you may file a complaint",
    "with the relevant supervisory authority (GDPR) or the California Attorney",
    "General (CCPA).",
    "",
    "=".repeat(50),
    "",
    "DEINDEX.ME — We have deleted all data associated with this session.",
    "Free, open-source. No accounts. No stored data."
  );

  return lines.join("\n");
}
