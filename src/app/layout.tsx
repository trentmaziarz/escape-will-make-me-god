import type { Metadata } from "next";
import { Playfair_Display, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DEINDEX.ME — Delete Your Digital Presence",
  description:
    "Free, open-source platform to discover and delete your digital footprint. No accounts. No stored data. One session. Total erasure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${jetbrains.variable}`}>
      <body>
        {children}
        <div className="scanline-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
