import type { Metadata } from "next";
import { getAllServices } from "@/lib/services-db";
import ServiceDirectory from "@/components/database/ServiceDirectory";

export const metadata: Metadata = {
  title: "Service Database — DEINDEX.ME",
  description:
    "Browse the open directory of services tracked by DEINDEX.ME. See deletion difficulty, methods, and expected response times for social media, data brokers, and more.",
  openGraph: {
    title: "Service Database — DEINDEX.ME",
    description:
      "Browse the open directory of services tracked by DEINDEX.ME. See deletion difficulty, methods, and expected response times.",
    url: "https://deindex.me/database",
  },
};

export default function DatabasePage() {
  const services = getAllServices();

  return (
    <main id="main-content" className="flex min-h-screen flex-col px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[680px]">
        {/* Header */}
        <h1 className="font-display text-[clamp(32px,6vw,56px)] font-black leading-[1.05] tracking-[-1px] text-text-primary mb-2">
          The Open Directory
        </h1>
        <p className="text-[13px] text-text-muted mb-2">
          Every service we track. Deletion difficulty, method, and expected
          response time — all verified and open source.
        </p>
        <p className="text-[10px] text-text-muted tracking-[2px] uppercase mb-12">
          {services.length} services indexed
        </p>

        <ServiceDirectory services={services} />

        {/* Contribute CTA */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-[13px] text-text-muted mb-4">
            Know a service that should be here?
          </p>
          <a
            href="https://github.com/DEINDEX-ME/deindex.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[10px] tracking-[4px] uppercase px-6 py-3 border border-accent-red text-accent-red hover:bg-accent-red hover:text-bg-primary transition-colors"
          >
            Contribute on GitHub
          </a>
          <p className="text-[9px] text-text-ghost tracking-[1px] mt-4">
            The database is community-maintained and open source under MIT license.
          </p>
        </div>
      </div>
    </main>
  );
}
