import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import DetonatorFlow from "@/components/detonator/DetonatorFlow";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "metadata.detonate",
  });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function DetonatePage() {
  const t = await getTranslations("common");

  return (
    <main id="main-content" className="min-h-screen bg-bg-primary">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <span className="text-xs text-text-ghost tracking-[3px] uppercase">
              {t("loading")}
            </span>
          </div>
        }
      >
        <DetonatorFlow />
      </Suspense>
    </main>
  );
}
