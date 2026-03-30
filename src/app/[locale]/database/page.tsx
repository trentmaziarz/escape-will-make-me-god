import { getTranslations } from "next-intl/server";
import { getAllServices } from "@/lib/services-db";
import ServiceDirectory from "@/components/database/ServiceDirectory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "metadata.database",
  });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://deindex.me/database",
    },
  };
}

export default async function DatabasePage() {
  const services = getAllServices();
  const t = await getTranslations("database");

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col px-4 py-10 sm:px-6"
    >
      <div className="mx-auto w-full max-w-[680px]">
        <h1 className="font-display text-[clamp(32px,6vw,56px)] font-black leading-[1.05] tracking-[-1px] text-text-primary mb-2">
          {t("title")}
        </h1>
        <p className="text-[13px] text-text-muted mb-2">{t("description")}</p>
        <p className="text-[10px] text-text-muted tracking-[2px] uppercase mb-12">
          {t("servicesIndexed", { count: services.length })}
        </p>

        <ServiceDirectory services={services} />

        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-[13px] text-text-muted mb-4">
            {t("contributeCta")}
          </p>
          <a
            href="https://github.com/DEINDEX-ME/deindex.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[10px] tracking-[4px] uppercase px-6 py-3 border border-accent-red text-accent-red hover:bg-accent-red hover:text-bg-primary transition-colors"
          >
            {t("contributeButton")}
          </a>
          <p className="text-[9px] text-text-ghost tracking-[1px] mt-4">
            {t("contributeNote")}
          </p>
        </div>
      </div>
    </main>
  );
}
