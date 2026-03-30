import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — DEINDEX.ME",
  description:
    "Why DEINDEX.ME exists. The philosophy behind mass digital deletion. Open source, free forever, uncompromised.",
  openGraph: {
    title: "About — DEINDEX.ME",
    description:
      "Why DEINDEX.ME exists. The philosophy behind mass digital deletion.",
    url: "https://deindex.me/about",
  },
};

export default function AboutPage() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[680px]">
        {/* Header */}
        <h1 className="font-display text-[clamp(32px,6vw,56px)] font-black leading-[1.05] tracking-[-1px] text-text-primary mb-2">
          The Cause
        </h1>
        <p className="text-[10px] text-text-muted tracking-[2px] uppercase mb-12">
          Why this exists
        </p>

        {/* Philosophy */}
        <section className="mb-16">
          <p className="text-[15px] text-text-secondary leading-[1.8] mb-6">
            You did not consent to this. Nobody sat you down and asked if it was
            acceptable for 4,000 companies to build a profile on you. Nobody
            asked permission before your phone number was sold to data brokers,
            your browsing history fed to ad networks, or your face indexed by
            surveillance systems you never knew existed.
          </p>
          <p className="text-[15px] text-text-secondary leading-[1.8] mb-6">
            The system was designed to make opting out impossible. Every service
            buries its deletion page. Every broker requires a different form. The
            friction is the feature. They are counting on you giving up.
          </p>
          <p className="text-[15px] text-text-primary leading-[1.8] mb-6">
            DEINDEX.ME is the eject button they never wanted you to have.
          </p>
          <p className="text-[15px] text-text-secondary leading-[1.8]">
            One session. Enter your email. We discover your footprint. You
            choose what to destroy. We fire the deletion requests. You get a
            report. We forget you ever existed. No accounts. No stored data. The
            platform eats itself after serving you.
          </p>
        </section>

        {/* Principles */}
        <section className="mb-16">
          <h2 className="text-[10px] tracking-[4px] uppercase text-text-muted mb-8">
            Principles
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-[13px] text-text-primary mb-1">
                Free forever
              </h3>
              <p className="text-[13px] text-text-muted leading-[1.8]">
                Privacy is a right, not a product. This tool will never have a
                paywall, a premium tier, or a &ldquo;pro&rdquo; plan.
              </p>
            </div>
            <div>
              <h3 className="text-[13px] text-text-primary mb-1">
                Open source
              </h3>
              <p className="text-[13px] text-text-muted leading-[1.8]">
                Every line of code is public. Audit it. Fork it. Improve it.
                Trust is earned by transparency, not promises.
              </p>
            </div>
            <div>
              <h3 className="text-[13px] text-text-primary mb-1">
                Stateless
              </h3>
              <p className="text-[13px] text-text-muted leading-[1.8]">
                No database. No user sessions. No cookies. Your data exists in
                your browser for the duration of one session, then it is gone.
                We cannot be breached because we hold nothing.
              </p>
            </div>
            <div>
              <h3 className="text-[13px] text-text-primary mb-1">
                No surveillance
              </h3>
              <p className="text-[13px] text-text-muted leading-[1.8]">
                No tracking pixels. No analytics that identify individuals. No
                ads. We use cookieless, privacy-respecting analytics to count
                page views. That is it.
              </p>
            </div>
          </div>
        </section>

        {/* Who built this */}
        <section className="mb-16">
          <h2 className="text-[10px] tracking-[4px] uppercase text-text-muted mb-8">
            Who built this
          </h2>
          <p className="text-[15px] text-text-secondary leading-[1.8] mb-6">
            DEINDEX.ME is built and maintained by people who believe the internet
            needs an undo button. We are developers, privacy researchers, and
            digital rights advocates who got tired of watching data brokers
            profit from information people never agreed to share.
          </p>
          <p className="text-[15px] text-text-secondary leading-[1.8]">
            The project is community-driven and funded entirely by donations.
            No investors. No board. No one to answer to except the people we serve.
          </p>
        </section>

        {/* Links */}
        <section className="mb-16">
          <h2 className="text-[10px] tracking-[4px] uppercase text-text-muted mb-8">
            Get involved
          </h2>
          <div className="space-y-4">
            <a
              href="https://github.com/DEINDEX-ME/deindex.me"
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-border px-6 py-4 hover:border-text-dim transition-colors group"
            >
              <span className="text-[13px] text-text-primary group-hover:text-accent-red transition-colors">
                GitHub Repository
              </span>
              <span className="block text-[11px] text-text-muted mt-1">
                View the source, report issues, contribute to the service database
              </span>
            </a>
            <Link
              href="/donate"
              className="block border border-border px-6 py-4 hover:border-text-dim transition-colors group"
            >
              <span className="text-[13px] text-text-primary group-hover:text-accent-red transition-colors">
                Support the Cause
              </span>
              <span className="block text-[11px] text-text-muted mt-1">
                Help fund hosting, API costs, and development
              </span>
            </Link>
          </div>
        </section>

        {/* Press */}
        <section className="mb-16">
          <h2 className="text-[10px] tracking-[4px] uppercase text-text-muted mb-8">
            Press &amp; media
          </h2>
          <p className="text-[13px] text-text-secondary leading-[1.8] mb-4">
            For press inquiries, interviews, or media requests:
          </p>
          <a
            href="mailto:press@deindex.me"
            className="text-[13px] text-accent-red hover:text-accent-red-hover transition-colors"
          >
            press@deindex.me
          </a>
        </section>

        {/* Legal links */}
        <div className="pt-8 border-t border-border flex gap-8">
          <Link
            href="/about/privacy"
            className="text-[11px] text-text-muted hover:text-text-secondary transition-colors tracking-[1px] uppercase"
          >
            Privacy Policy
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
