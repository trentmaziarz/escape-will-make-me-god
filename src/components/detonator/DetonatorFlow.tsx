"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDetonation } from "@/hooks/useDetonation";
import { useScan } from "@/hooks/useScan";
import ScanPhase from "./ScanPhase";
import ReviewPhase from "./ReviewPhase";
import DetonationPhase from "./DetonationPhase";
import CompletePhase from "./CompletePhase";

export default function DetonatorFlow() {
  const t = useTranslations("detonator");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const scanStarted = useRef(false);
  const redirected = useRef(false);

  const {
    phase,
    discoveredServices,
    selectedServiceIds,
    results,
    maskedEmail,
    hibpError,
    error,
    tokenInvalid,
    startScan,
    toggleService,
    selectAll,
    deselectAll,
    detonate,
    goToReview,
    goToComplete,
  } = useDetonation(token);

  const {
    visibleServices,
    progress,
    isRevealing,
    isComplete: scanRevealComplete,
    startReveal,
  } = useScan(discoveredServices);

  // Redirect to homepage if no token is present
  useEffect(() => {
    if (!token && !redirected.current) {
      redirected.current = true;
      router.replace("/?redirect=no-token");
    }
  }, [token, router]);

  useEffect(() => {
    if (token && !scanStarted.current) {
      scanStarted.current = true;
      startScan();
    }
  }, [token, startScan]);

  useEffect(() => {
    if (discoveredServices.length > 0 && phase === "scanning") {
      startReveal();
    }
  }, [discoveredServices, phase, startReveal]);

  useEffect(() => {
    if (scanRevealComplete) {
      const timer = setTimeout(goToReview, 800);
      return () => clearTimeout(timer);
    }
  }, [scanRevealComplete, goToReview]);

  // Redirect to homepage if token is expired/invalid
  useEffect(() => {
    if (tokenInvalid && phase === "idle" && !redirected.current) {
      redirected.current = true;
      router.replace("/?redirect=expired");
    }
  }, [tokenInvalid, phase, router]);

  // Show nothing while redirecting (no token or token invalid)
  if (!token || (tokenInvalid && phase === "idle")) {
    return null;
  }

  // Show error UI for scan failures (valid token, but scan API failed)
  if (error && phase === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="font-headline text-2xl font-bold text-text-primary mb-4">
            {t("error")}
          </h1>
          <p className="font-mono text-sm text-text-muted mb-6">
            {t("scanErrorDescription")}
          </p>
          <Link
            href="/"
            className="font-mono text-xs text-accent-red hover:underline tracking-widest uppercase"
          >
            {t("returnHome")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {phase === "scanning" && (
        <ScanPhase
          visibleServices={visibleServices}
          progress={progress}
          isRevealing={isRevealing}
          maskedEmail={maskedEmail}
        />
      )}

      {phase === "review" && (
        <ReviewPhase
          services={discoveredServices}
          selectedServiceIds={selectedServiceIds}
          hibpError={hibpError}
          onToggle={toggleService}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onDetonate={detonate}
        />
      )}

      {phase === "detonating" && (
        <DetonationPhase
          services={discoveredServices}
          selectedServiceIds={selectedServiceIds}
          apiDone={results !== null}
          onComplete={goToComplete}
        />
      )}

      {phase === "complete" && results && (
        <CompletePhase results={results} maskedEmail={maskedEmail} />
      )}
    </>
  );
}
