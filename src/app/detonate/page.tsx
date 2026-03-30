import type { Metadata } from "next";
import { Suspense } from "react";
import DetonatorFlow from "@/components/detonator/DetonatorFlow";

export const metadata: Metadata = {
  title: "DEINDEX.ME — Detonate",
  description:
    "Your digital presence ends here. Review discovered services and trigger mass deletion.",
};

export default function DetonatePage() {
  return (
    <main id="main-content" className="min-h-screen bg-bg-primary">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <span className="text-xs text-text-ghost tracking-[3px] uppercase">
              Loading...
            </span>
          </div>
        }
      >
        <DetonatorFlow />
      </Suspense>
    </main>
  );
}
