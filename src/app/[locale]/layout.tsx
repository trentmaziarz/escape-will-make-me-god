import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Playfair_Display, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";
import ScanlineOverlay from "@/components/layout/ScanlineOverlay";
import Footer from "@/components/layout/Footer";
import MuteToggle from "@/components/ui/MuteToggle";
import "@/styles/globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
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
      siteName: "DEINDEX.ME",
      type: "website",
      locale: params.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    metadataBase: new URL("https://deindex.me"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations("common");

  return (
    <html
      lang={locale}
      className={`${playfair.variable} ${jetbrains.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider messages={messages}>
          <a href="#main-content" className="skip-nav">
            {t("skipToContent")}
          </a>
          {children}
          <Footer />
          <MuteToggle />
          <ScanlineOverlay />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
