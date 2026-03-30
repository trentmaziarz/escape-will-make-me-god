import type { ServiceEntry } from "@/data/services/schema";
import { resend, FROM_DELETE } from "@/lib/email/resend";
import { generateGDPR } from "./gdpr-template";
import { generateCCPA } from "./ccpa-template";
import type { DeletionTemplate } from "./gdpr-template";

// GDPR takes precedence over CCPA when both apply — GDPR's erasure
// rights (Art. 17) are stricter and more widely enforceable.
function pickTemplate(
  service: ServiceEntry,
  email: string,
  phone: string
): DeletionTemplate {
  const dpoEmail = service.dpoEmail ?? service.deletionEmail ?? "";

  if (service.gdprApplicable) {
    return generateGDPR({
      email,
      phone,
      serviceName: service.name,
      dpoEmail,
    });
  }

  return generateCCPA({
    email,
    phone,
    serviceName: service.name,
    dpoEmail,
  });
}

/**
 * Sends an auto-deletion email from delete@deindex.me to the service's
 * DPO/deletion contact, with the user CC'd.
 */
export async function sendAutoEmail(
  service: ServiceEntry,
  userEmail: string,
  userPhone: string
): Promise<void> {
  const to = service.dpoEmail ?? service.deletionEmail;
  if (!to) {
    throw new Error(
      `Service "${service.name}" has no DPO or deletion email configured`
    );
  }

  const { subject, body } = pickTemplate(service, userEmail, userPhone);

  await resend.emails.send({
    from: FROM_DELETE,
    to,
    cc: userEmail,
    subject,
    text: body,
  });
}

/**
 * Generates a pre-filled email draft for the user to send themselves.
 * Used for services where auto-sending is not appropriate.
 */
export function generateUserDraft(
  service: ServiceEntry,
  userEmail: string,
  userPhone: string
): { to: string; subject: string; body: string } {
  const to = service.dpoEmail ?? service.deletionEmail ?? "";
  const { subject, body } = pickTemplate(service, userEmail, userPhone);
  return { to, subject, body };
}
