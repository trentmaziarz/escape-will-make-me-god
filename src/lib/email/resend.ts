import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_NOREPLY = process.env.RESEND_FROM_NOREPLY ?? "noreply@deindex.me";
export const FROM_DELETE = process.env.RESEND_FROM_DELETE ?? "delete@deindex.me";
