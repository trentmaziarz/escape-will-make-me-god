"use client";

import { useEffect, useRef } from "react";
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

  // Redirect to homepage if token is expired/invalid (scan error on idle phase)
  useEffect(() => {
    if (error && phase === "idle" && !redirected.current) {
      redirected.current = true;
      router.replace("/?redirect=expired");
    }
  }, [error, phase, router]);

  // Show nothing while redirecting
  if (!token || (error && phase === "idle")) {
    return null;
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
