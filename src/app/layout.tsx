import type { Metadata } from "next";
import { Playfair_Display, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "DEINDEX.ME — Delete Your Digital Presence",
  description:
    "Free, open-source platform to discover and delete your digital footprint. No accounts. No stored data. One session. Total erasure.",
  openGraph: {
    title: "DEINDEX.ME — Delete Your Digital Presence",
    description:
      "Free, open-source platform to discover and delete your digital footprint. No accounts. No stored data. One session. Total erasure.",
    url: "https://deindex.me",
    siteName: "DEINDEX.ME",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEINDEX.ME — Delete Your Digital Presence",
    description:
      "Free, open-source platform to discover and delete your digital footprint. No accounts. No stored data. One session. Total erasure.",
  },
  metadataBase: new URL("https://deindex.me"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${jetbrains.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>
        {children}
        <Footer />
        <MuteToggle />
        <ScanlineOverlay />
      </body>
    </html>
  );
}
