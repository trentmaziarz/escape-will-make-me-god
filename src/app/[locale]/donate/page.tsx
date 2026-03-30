import { getTranslations } from "next-intl/server";
import DonateContent from "@/components/donate/DonateContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "metadata.donate",
  });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; cancelled?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const success = resolvedSearchParams.success === "true";
  const cancelled = resolvedSearchParams.cancelled === "true";

  return <DonateContent success={success} cancelled={cancelled} />;
}
