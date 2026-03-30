import { getTranslations } from "next-intl/server";
import DonateContent from "@/components/donate/DonateContent";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "metadata.donate",
  });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function DonatePage({
  searchParams,
}: {
  searchParams: { success?: string; cancelled?: string };
}) {
  const success = searchParams.success === "true";
  const cancelled = searchParams.cancelled === "true";

  return <DonateContent success={success} cancelled={cancelled} />;
}
