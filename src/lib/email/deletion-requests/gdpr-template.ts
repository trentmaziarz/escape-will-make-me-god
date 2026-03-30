export interface GDPRTemplateInput {
  email: string;
  phone: string;
  serviceName: string;
  dpoEmail: string;
}

export interface DeletionTemplate {
  subject: string;
  body: string;
}

// GDPR Article 17(2) requires notification to third parties who received
// the data. The template explicitly invokes this to ensure legal compliance.
export function generateGDPR(input: GDPRTemplateInput): DeletionTemplate {
  const { email, phone } = input;

  const subject = "Right to Erasure Request — GDPR Article 17";

  const body = `Dear Data Protection Officer,

I am writing to exercise my right to erasure under Article 17 of the General Data Protection Regulation (EU) 2016/679.

I request that you erase all personal data you hold concerning me, including but not limited to:
- Account information and profile data
- Usage data and activity logs
- Any data obtained from or shared with third parties
- Marketing and advertising profiles
- Any backups or archived copies

My identifying information:
- Email address: ${email}
- Phone number: ${phone}

I withdraw any and all consent previously given for the processing of my personal data.

Under Article 17(2), I also request that you inform any third parties with whom you have shared my personal data of this erasure request.

Please confirm completion of this erasure within 30 days of receipt, as required by Article 12(3) of the GDPR. If you are unable to comply, please provide a detailed explanation of the legal basis for your refusal under Article 17(3).

If I do not receive a satisfactory response within 30 days, I reserve the right to lodge a complaint with the relevant supervisory authority.

Regards,
${email}`;

  return { subject, body };
}
