import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "metadata.privacy",
  });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://deindex.me/about/privacy",
    },
  };
}

const LAST_UPDATED = "March 30, 2026";

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  const highlight = (chunks: ReactNode) => (
    <span className="text-text-secondary">{chunks}</span>
  );

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col px-4 py-10 sm:px-6"
    >
      <div className="mx-auto w-full max-w-[680px]">
        <h1 className="font-display text-[clamp(32px,6vw,56px)] font-black leading-[1.05] tracking-[-1px] text-text-primary mb-2">
          {t("title")}
        </h1>
        <p className="text-[10px] text-text-muted tracking-[2px] uppercase mb-12">
          {t("lastUpdated", { date: LAST_UPDATED })}
        </p>

        {/* TL;DR */}
        <div className="border border-border px-6 py-5 mb-12">
          <p className="text-[11px] tracking-[2px] uppercase text-text-muted mb-3">
            {t("shortVersionLabel")}
          </p>
          <p className="text-[15px] text-text-primary leading-[1.8]">
            {t("shortVersionText")}
          </p>
        </div>

        <div className="space-y-12">
          {/* Section 1 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section1Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8] mb-3">
              {t("section1Intro")}
            </p>
            <ul className="text-[13px] text-text-muted leading-[1.8] space-y-1 ml-4">
              <li>{t.rich("section1EmailItem", { highlight })}</li>
              <li>{t.rich("section1PhoneItem", { highlight })}</li>
            </ul>
            <p className="text-[13px] text-text-muted leading-[1.8] mt-3">
              {t("section1Closing")}
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section2Heading")}
            </h2>
            <ul className="text-[13px] text-text-muted leading-[1.8] space-y-1 ml-4">
              <li>{t.rich("section2DiscoveryItem", { highlight })}</li>
              <li>{t.rich("section2DeletionItem", { highlight })}</li>
              <li>{t.rich("section2ReportItem", { highlight })}</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section3Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              {t("section3Body")}
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section4Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8] mb-3">
              {t("section4Body1")}
            </p>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              {t("section4Body2")}
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section5Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              {t("section5Body")}
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section6Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              {t("section6Body")}
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section7Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8] mb-3">
              {t("section7Intro")}
            </p>
            <ul className="text-[13px] text-text-muted leading-[1.8] space-y-1 ml-4">
              <li>{t.rich("section7ResendItem", { highlight })}</li>
              <li>{t.rich("section7StripeItem", { highlight })}</li>
              <li>{t.rich("section7CloudflareItem", { highlight })}</li>
              <li>{t.rich("section7HibpItem", { highlight })}</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section8Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8] mb-3">
              {t("section8Body1")}
            </p>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              {t("section8Body2")}
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section9Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8] mb-2">
              {t("section9Body")}
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
              {t("section10Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              {t("section10Body")}
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border flex gap-8">
          <Link
            href="/about"
            className="text-[11px] text-text-muted hover:text-text-secondary transition-colors tracking-[1px] uppercase"
          >
            {t("footerAbout")}
          </Link>
          <Link
            href="/about/terms"
            className="text-[11px] text-text-muted hover:text-text-secondary transition-colors tracking-[1px] uppercase"
          >
            {t("footerTerms")}
          </Link>
        </div>
      </div>
    </main>
  );
}
