import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — DEINDEX.ME",
  description:
    "Terms governing your use of DEINDEX.ME, the free digital presence deletion platform.",
  openGraph: {
    title: "Terms of Service — DEINDEX.ME",
    description:
      "Terms governing your use of DEINDEX.ME.",
    url: "https://deindex.me/about/terms",
  },
};

const LAST_UPDATED = "March 30, 2026";

export default function TermsPage() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[680px]">
        {/* Header */}
        <h1 className="font-display text-[clamp(32px,6vw,56px)] font-black leading-[1.05] tracking-[-1px] text-text-primary mb-2">
          Terms of Service
        </h1>
        <p className="text-[10px] text-text-muted tracking-[2px] uppercase mb-12">
          Last updated {LAST_UPDATED}
        </p>

        {/* TL;DR */}
        <div className="border border-border px-6 py-5 mb-12">
          <p className="text-[11px] tracking-[2px] uppercase text-text-muted mb-3">
            The short version
          </p>
          <p className="text-[15px] text-text-primary leading-[1.8]">
            DEINDEX.ME sends deletion requests on your behalf. We cannot
            guarantee companies will comply. We do not store your data. The
            service is free and open source.
          </p>
        </div>

        <div className="space-y-12">
          {/* Section 1 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              1. What we do
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              DEINDEX.ME is a free platform that discovers digital accounts
              associated with your email address and phone number, then generates
              and sends deletion requests to those services on your behalf. We
              use GDPR Article 17 (Right to Erasure) and CCPA Section 1798.105
              (Right to Delete) as the legal basis for these requests.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              2. Your authorization
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              By using DEINDEX.ME, you authorize us to: (a) scan for accounts
              associated with your email address and phone number using the Have
              I Been Pwned API and our curated service database, (b) send
              deletion requests to the services you select, using your email
              address as the data subject identifier, and (c) email you a PDF
              report summarizing the actions taken. You confirm that the email
              address and phone number you provide are your own.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              3. No guarantees
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8] mb-3">
              We send deletion requests. We cannot guarantee that companies will
              comply. Compliance depends on:
            </p>
            <ul className="text-[13px] text-text-muted leading-[1.8] space-y-1 ml-4">
              <li>
                The applicable law in your jurisdiction and theirs
              </li>
              <li>
                Whether the company falls within the scope of GDPR or CCPA
              </li>
              <li>
                Whether a legal exception applies (legal holds, fraud
                prevention, etc.)
              </li>
              <li>
                The company&apos;s own data deletion policies and response times
              </li>
            </ul>
            <p className="text-[13px] text-text-muted leading-[1.8] mt-3">
              GDPR requires a response within 30 days. CCPA requires a response
              within 45 days. If a company does not respond, your detonation
              report includes guidance on filing complaints with the relevant
              supervisory authority.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              4. Your responsibility
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              Some services require actions that only you can take — identity
              verification, multi-step account deletion, or sending emails from
              your own email client. Your detonation report will clearly
              identify these services and provide step-by-step instructions. You
              are responsible for completing these actions yourself.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              5. No accounts, no stored data
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              DEINDEX.ME does not create user accounts. We do not store your
              email, phone number, scan results, or any other personal data after
              your session ends. All data is held temporarily in your browser and
              in a short-lived encrypted token. Once your report is emailed,
              everything is deleted. See our{" "}
              <Link
                href="/about/privacy"
                className="text-accent-red hover:text-accent-red-hover transition-colors"
              >
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              6. Age requirement
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              You must be at least 16 years old to use DEINDEX.ME if you are in
              the EU/EEA (GDPR minimum), or at least 13 years old if you are in
              the United States (CCPA/COPPA). If you are under the applicable
              minimum age, do not use this service.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              7. Open source
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              DEINDEX.ME is open source software licensed under the{" "}
              <a
                href="https://opensource.org/licenses/MIT"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-red hover:text-accent-red-hover transition-colors"
              >
                MIT License
              </a>
              . The source code is publicly available for review, audit, and
              contribution.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              8. Limitation of liability
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              DEINDEX.ME is provided &ldquo;as is&rdquo; without warranty of any
              kind. To the maximum extent permitted by law, we are not liable for
              any damages arising from the use of this service, including but not
              limited to: incomplete data deletion by third parties, service
              downtime, errors in account discovery, or any actions taken by
              third-party services in response to deletion requests. This is a
              free service operated in good faith.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              9. Changes to these terms
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              We may update these terms. Changes will be reflected on this page
              with an updated date. Continued use of the service after changes
              constitutes acceptance of the revised terms.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              10. Contact
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8] mb-2">
              For questions about these terms:
            </p>
            <a
              href="mailto:legal@deindex.me"
              className="text-[13px] text-accent-red hover:text-accent-red-hover transition-colors"
            >
              legal@deindex.me
            </a>
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
            href="/about/privacy"
            className="text-[11px] text-text-muted hover:text-text-secondary transition-colors tracking-[1px] uppercase"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
