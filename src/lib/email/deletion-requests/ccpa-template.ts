export interface CCPATemplateInput {
  email: string;
  phone: string;
  serviceName: string;
  dpoEmail: string;
}

export interface DeletionTemplate {
  subject: string;
  body: string;
}

export function generateCCPA(input: CCPATemplateInput): DeletionTemplate {
  const { email, phone } = input;

  const subject = "Right to Delete Request — California Consumer Privacy Act";

  const body = `To Whom It May Concern,

I am a California resident exercising my right to delete personal information under the California Consumer Privacy Act (CCPA), Civil Code Section 1798.105.

I request that you delete all personal information you have collected about me, including but not limited to:
- Account and profile information
- Usage data, browsing history, and activity logs
- Information obtained from third-party sources
- Marketing and advertising profiles

My identifying information:
- Email address: ${email}
- Phone number: ${phone}

Please confirm the deletion of my personal information within 45 days of receipt, as required by the CCPA. If you require additional time, please notify me of the extension within 45 days.

If you believe an exception under Section 1798.105(d) applies to any portion of my data, please specify which exception and which data it applies to.

Regards,
${email}`;

  return { subject, body };
}
