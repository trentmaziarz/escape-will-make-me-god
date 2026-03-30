import { Resend } from "resend";

// Lazy-init: Resend constructor throws when RESEND_API_KEY is absent,
// which crashes `next build` during page-data collection.
let _client: Resend | undefined;

export const resend = {
  emails: {
    send(...args: Parameters<Resend["emails"]["send"]>) {
      if (!_client) _client = new Resend(process.env.RESEND_API_KEY);
      return _client.emails.send(...args);
    },
  },
};

export const FROM_NOREPLY = process.env.RESEND_FROM_NOREPLY ?? "noreply@deindex.me";
export const FROM_DELETE = process.env.RESEND_FROM_DELETE ?? "delete@deindex.me";
