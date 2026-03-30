/**
 * Verification email — sent from noreply@deindex.me after the user
 * submits their email on the landing page.  Contains a single CTA
 * link that opens /detonate?token=<JWE>.
 *
 * Returns both HTML (branded) and plain-text versions.
 */

export interface VerificationEmailProps {
  detonateUrl: string;
}

export function verificationHtml({ detonateUrl }: VerificationEmailProps): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e8e4de;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
    <tr><td align="center" style="padding:48px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Logo -->
        <tr><td style="padding-bottom:32px;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:900;color:#e8e4de;letter-spacing:-1px;">
            DEINDEX<span style="color:#c41e1e;">.ME</span>
          </span>
        </td></tr>

        <!-- Heading -->
        <tr><td style="padding-bottom:24px;">
          <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;font-style:italic;color:#e8e4de;line-height:1.4;">
            You requested to disappear.
          </h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding-bottom:32px;font-family:'Courier New',Courier,monospace;font-size:14px;line-height:1.7;color:#888888;">
          We received a request to scan your digital footprint and begin the deletion process.
          If this was you, click the button below to confirm and start the scan.
          <br><br>
          This link expires in <strong style="color:#e8e4de;">1 hour</strong>.
          If you did not make this request, you can safely ignore this email.
        </td></tr>

        <!-- CTA Button -->
        <tr><td style="padding-bottom:40px;">
          <a href="${detonateUrl}" target="_blank" style="display:inline-block;padding:16px 40px;border:2px solid #c41e1e;color:#c41e1e;font-family:'Courier New',Courier,monospace;font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;text-decoration:none;">
            CONFIRM YOUR DISAPPEARANCE
          </a>
        </td></tr>

        <!-- Consent notice -->
        <tr><td style="padding-bottom:24px;font-family:'Courier New',Courier,monospace;font-size:11px;line-height:1.6;color:#555555;">
          By clicking the link above you consent to DEINDEX.ME scanning publicly
          available breach databases on your behalf and, upon your further
          confirmation, sending deletion requests to the services we discover.
          We process your email address and phone number solely for this purpose
          and delete all data immediately after delivering your report.
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding-bottom:24px;">
          <hr style="border:none;border-top:1px solid #2a2a2a;">
        </td></tr>

        <!-- Footer -->
        <tr><td style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#444444;letter-spacing:1px;">
          DEINDEX.ME &mdash; Free, open-source. No accounts. No stored data.
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function verificationText({ detonateUrl }: VerificationEmailProps): string {
  return `DEINDEX.ME — Confirm Your Disappearance

You requested to scan your digital footprint and begin the deletion process.

Click the link below to confirm and start the scan:
${detonateUrl}

This link expires in 1 hour.
If you did not make this request, you can safely ignore this email.

By clicking the link you consent to DEINDEX.ME scanning publicly available
breach databases on your behalf and, upon your further confirmation, sending
deletion requests to the services we discover. We process your email address
and phone number solely for this purpose and delete all data immediately
after delivering your report.

---
DEINDEX.ME — Free, open-source. No accounts. No stored data.`;
}
