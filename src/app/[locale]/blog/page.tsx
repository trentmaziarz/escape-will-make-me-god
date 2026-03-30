import { getTranslations } from "next-intl/server";
import BlogContent from "@/components/blog/BlogContent";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "metadata.blog",
  });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function BlogPage() {
  return <BlogContent />;
}
