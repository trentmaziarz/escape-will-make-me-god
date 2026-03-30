import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — DEINDEX.ME",
  description:
    "How DEINDEX.ME handles your data. Short version: we don't keep it.",
  openGraph: {
    title: "Privacy Policy — DEINDEX.ME",
    description: "How DEINDEX.ME handles your data. We don't keep it.",
    url: "https://deindex.me/about/privacy",
  },
};

const LAST_UPDATED = "March 30, 2026";

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[680px]">
        {/* Header */}
        <h1 className="font-display text-[clamp(32px,6vw,56px)] font-black leading-[1.05] tracking-[-1px] text-text-primary mb-2">
          Privacy Policy
        </h1>
        <p className="text-[10px] text-text-ghost tracking-[2px] uppercase mb-12">
          Last updated {LAST_UPDATED}
        </p>

        {/* TL;DR */}
        <div className="border border-border px-6 py-5 mb-12">
          <p className="text-[11px] tracking-[2px] uppercase text-text-ghost mb-3">
            The short version
          </p>
          <p className="text-[15px] text-text-primary leading-[1.8]">
            We collect your email and phone number for one session. We use them
            to find your accounts and send deletion requests. Then we delete
            everything. We have no database. There is nothing to breach.
          </p>
        </div>

        <div className="space-y-12">
          {/* Section 1 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              1. What we collect
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8] mb-3">
              When you use DEINDEX.ME, you voluntarily provide:
            </p>
            <ul className="text-[13px] text-text-muted leading-[1.8] space-y-1 ml-4">
              <li>
                <span className="text-text-secondary">Email address</span> — used
                to discover accounts, send deletion requests, and deliver your
                detonation report
              </li>
              <li>
                <span className="text-text-secondary">Phone number</span>{" "}
                (optional) — used to expand account discovery and include in
                deletion requests where relevant
              </li>
            </ul>
            <p className="text-[13px] text-text-muted leading-[1.8] mt-3">
              That is everything. We do not collect names, addresses, payment
              details, IP addresses for identification, or any other personal
              information.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              2. How we use it
            </h2>
            <ul className="text-[13px] text-text-muted leading-[1.8] space-y-1 ml-4">
              <li>
                <span className="text-text-secondary">Account discovery</span>{" "}
                — we query the Have I Been Pwned API and our curated service
                database to identify where your data exists
              </li>
              <li>
                <span className="text-text-secondary">Deletion requests</span>{" "}
                — we generate and send GDPR/CCPA deletion requests to services
                you select
              </li>
              <li>
                <span className="text-text-secondary">Detonation report</span>{" "}
                — we generate a PDF summarizing all actions taken and email it to
                you
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              3. How long we keep it
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              For the duration of a single session. All your data exists in your
              browser and in a short-lived encrypted token (JWT) that expires
              after one hour. Once your detonation report is emailed, everything
              is purged immediately. There is no database. There is no
              &ldquo;30-day retention.&rdquo; There is no backup. It is gone.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              4. What we share
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8] mb-3">
              Your email and phone number are included in the deletion requests
              sent to third-party services. This is the entire point — for a
              company to delete your data, they need to know which data is yours.
            </p>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              We do not sell, rent, or share your information with anyone for any
              other purpose. Ever.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              5. Cookies
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              None. Zero. We do not use cookies. We do not use local storage for
              tracking. We do not use fingerprinting.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              6. Analytics
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              We use privacy-respecting, cookieless analytics (Plausible or
              Umami) to understand how people use the site — page views, referral
              sources, country-level geography. These tools do not track
              individuals, do not use cookies, and comply with GDPR without
              requiring consent. We cannot identify you from our analytics data.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              7. Third-party services
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8] mb-3">
              DEINDEX.ME uses the following third-party services:
            </p>
            <ul className="text-[13px] text-text-muted leading-[1.8] space-y-1 ml-4">
              <li>
                <span className="text-text-secondary">Resend</span> — email
                delivery (verification emails, deletion requests, reports)
              </li>
              <li>
                <span className="text-text-secondary">Stripe</span> — donation
                processing (we never see or store your payment information)
              </li>
              <li>
                <span className="text-text-secondary">Cloudflare</span> — DNS,
                CDN, and Turnstile bot prevention
              </li>
              <li>
                <span className="text-text-secondary">Have I Been Pwned</span>{" "}
                — breach database for account discovery
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              8. Your rights
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8] mb-3">
              Under GDPR (EU/EEA) and CCPA (California), you have the right to
              access, correct, and delete your personal data. Since we delete
              everything immediately after your session ends, there is nothing to
              request deletion of after the fact.
            </p>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              If you have questions about data processing during an active
              session, contact us at the address below.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              9. Contact
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8] mb-2">
              For privacy inquiries:
            </p>
            <a
              href="mailto:privacy@deindex.me"
              className="text-[13px] text-accent-red hover:text-accent-red-hover transition-colors"
            >
              privacy@deindex.me
            </a>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              10. Changes to this policy
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              If we update this policy, we will update this page and the
              &ldquo;Last updated&rdquo; date above. We cannot notify you by
              email because we do not have your email. The spirit of this policy
              will not change: we collect the minimum, we keep nothing, and we
              never sell your data.
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border flex gap-8">
          <Link
            href="/about"
            className="text-[11px] text-text-muted hover:text-text-secondary transition-colors tracking-[1px] uppercase"
          >
            About
          </Link>
          <Link
            href="/about/terms"
            className="text-[11px] text-text-muted hover:text-text-secondary transition-colors tracking-[1px] uppercase"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </main>
  );
}
