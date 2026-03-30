import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import ManifestoFlow from "@/components/manifesto/ManifestoFlow";
import Counter from "@/components/layout/Counter";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "metadata.home",
  });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://deindex.me",
    },
  };
}

export default function Home() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col px-4 pt-[12vh] pb-10 sm:px-6"
    >
      <div className="mx-auto w-full max-w-[680px]">
        <ManifestoFlow />
      </div>
      <Suspense fallback={null}>
        <Counter />
      </Suspense>
    </main>
  );
}
