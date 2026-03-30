import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "metadata.terms",
  });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://deindex.me/about/terms",
    },
  };
}

const LAST_UPDATED = "March 30, 2026";

export default async function TermsPage() {
  const t = await getTranslations("terms");

  const privacyLink = (chunks: ReactNode) => (
    <Link
      href="/about/privacy"
      className="text-accent-red hover:text-accent-red-hover transition-colors"
    >
      {chunks}
    </Link>
  );

  const mitLink = (chunks: ReactNode) => (
    <a
      href="https://opensource.org/licenses/MIT"
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent-red hover:text-accent-red-hover transition-colors"
    >
      {chunks}
    </a>
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
          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section1Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              {t("section1Body")}
            </p>
          </section>

          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section2Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              {t("section2Body")}
            </p>
          </section>

          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section3Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8] mb-3">
              {t("section3Intro")}
            </p>
            <ul className="text-[13px] text-text-muted leading-[1.8] space-y-1 ml-4">
              <li>{t("section3Item1")}</li>
              <li>{t("section3Item2")}</li>
              <li>{t("section3Item3")}</li>
              <li>{t("section3Item4")}</li>
            </ul>
            <p className="text-[13px] text-text-muted leading-[1.8] mt-3">
              {t("section3Closing")}
            </p>
          </section>

          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section4Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              {t("section4Body")}
            </p>
          </section>

          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section5Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              {t.rich("section5Body", { privacyLink })}
            </p>
          </section>

          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section6Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              {t("section6Body")}
            </p>
          </section>

          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section7Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              {t.rich("section7Body", { mitLink })}
            </p>
          </section>

          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section8Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              {t("section8Body")}
            </p>
          </section>

          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section9Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8]">
              {t("section9Body")}
            </p>
          </section>

          <section>
            <h2 className="text-[13px] text-text-primary mb-4">
              {t("section10Heading")}
            </h2>
            <p className="text-[13px] text-text-muted leading-[1.8] mb-2">
              {t("section10Body")}
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
            {t("footerAbout")}
          </Link>
          <Link
            href="/about/privacy"
            className="text-[11px] text-text-muted hover:text-text-secondary transition-colors tracking-[1px] uppercase"
          >
            {t("footerPrivacy")}
          </Link>
        </div>
      </div>
    </main>
  );
}
