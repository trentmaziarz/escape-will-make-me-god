import type { Metadata } from "next";
import { Suspense } from "react";
import ManifestoFlow from "@/components/manifesto/ManifestoFlow";
import Counter from "@/components/layout/Counter";

export const metadata: Metadata = {
  title: "DEINDEX.ME — Delete Your Digital Presence",
  description:
    "Free, open-source platform to discover and delete your digital footprint. GDPR & CCPA. No accounts. No stored data. One session. Total erasure.",
  openGraph: {
    title: "DEINDEX.ME — Delete Your Digital Presence",
    description:
      "Free, open-source platform to discover and delete your digital footprint. No accounts. No stored data. One session. Total erasure.",
    url: "https://deindex.me",
  },
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[680px]">
        <ManifestoFlow />
      </div>
      <Suspense fallback={null}>
        <Counter />
      </Suspense>
    </main>
  );
}
