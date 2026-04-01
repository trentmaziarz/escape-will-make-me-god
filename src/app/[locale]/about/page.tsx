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
    namespace: "metadata.about",
  });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://deindex.me/about",
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

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
          {t("subtitle")}
        </p>

        {/* Philosophy */}
        <section className="mb-16">
          <p className="text-[15px] text-text-secondary leading-[1.8] mb-6">
            {t("philosophy1")}
          </p>
          <p className="text-[15px] text-text-secondary leading-[1.8] mb-6">
            {t("philosophy2")}
          </p>
          <p className="text-[15px] text-text-primary leading-[1.8] mb-6">
            {t("philosophy3")}
          </p>
          <p className="text-[15px] text-text-secondary leading-[1.8]">
            {t("philosophy4")}
          </p>
        </section>

        {/* Principles */}
        <section className="mb-16">
          <h2 className="text-[10px] tracking-[4px] uppercase text-text-muted mb-8">
            {t("principlesHeading")}
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-[13px] text-text-primary mb-1">
                {t("freeForever")}
              </h3>
              <p className="text-[13px] text-text-muted leading-[1.8]">
                {t("freeForeverDescription")}
              </p>
            </div>
            <div>
              <h3 className="text-[13px] text-text-primary mb-1">
                {t("openSource")}
              </h3>
              <p className="text-[13px] text-text-muted leading-[1.8]">
                {t("openSourceDescription")}
              </p>
            </div>
            <div>
              <h3 className="text-[13px] text-text-primary mb-1">
                {t("stateless")}
              </h3>
              <p className="text-[13px] text-text-muted leading-[1.8]">
                {t("statelessDescription")}
              </p>
            </div>
            <div>
              <h3 className="text-[13px] text-text-primary mb-1">
                {t("noSurveillance")}
              </h3>
              <p className="text-[13px] text-text-muted leading-[1.8]">
                {t("noSurveillanceDescription")}
              </p>
            </div>
          </div>
        </section>

        {/* Who built this */}
        <section className="mb-16">
          <h2 className="text-[10px] tracking-[4px] uppercase text-text-muted mb-8">
            {t("whoBuiltHeading")}
          </h2>
          <p className="text-[15px] text-text-secondary leading-[1.8] mb-6">
            {t("whoBuilt1")}
          </p>
          <p className="text-[15px] text-text-secondary leading-[1.8]">
            {t("whoBuilt2")}
          </p>
        </section>

        {/* Links */}
        <section className="mb-16">
          <h2 className="text-[10px] tracking-[4px] uppercase text-text-muted mb-8">
            {t("getInvolvedHeading")}
          </h2>
          <div className="space-y-4">
            <a
              href="https://github.com/trentmaziarz/escape-will-make-me-god"
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-border px-6 py-4 hover:border-text-dim transition-colors group"
            >
              <span className="text-[13px] text-text-primary group-hover:text-accent-red transition-colors">
                {t("githubRepo")}
              </span>
              <span className="block text-[11px] text-text-muted mt-1">
                {t("githubRepoDescription")}
              </span>
            </a>
            <Link
              href="/donate"
              className="block border border-border px-6 py-4 hover:border-text-dim transition-colors group"
            >
              <span className="text-[13px] text-text-primary group-hover:text-accent-red transition-colors">
                {t("supportCause")}
              </span>
              <span className="block text-[11px] text-text-muted mt-1">
                {t("supportCauseDescription")}
              </span>
            </Link>
          </div>
        </section>

        {/* Press */}
        <section className="mb-16">
          <h2 className="text-[10px] tracking-[4px] uppercase text-text-muted mb-8">
            {t("pressHeading")}
          </h2>
          <p className="text-[13px] text-text-secondary leading-[1.8] mb-4">
            {t("pressDescription")}
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
            {t("privacyPolicy")}
          </Link>
          <Link
            href="/about/terms"
            className="text-[11px] text-text-muted hover:text-text-secondary transition-colors tracking-[1px] uppercase"
          >
            {t("termsOfService")}
          </Link>
        </div>
      </div>
    </main>
  );
}
