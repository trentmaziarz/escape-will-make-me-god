"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
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
  const token = searchParams.get("token") ?? "";
  const scanStarted = useRef(false);

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

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-text-primary mb-4">
            {t("invalidLink")}
          </h1>
          <p className="text-sm text-text-muted">
            {t("invalidLinkDescription")}
          </p>
        </div>
      </div>
    );
  }

  if (error && phase === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-accent-red mb-4">
            {t("error")}
          </h1>
          <p className="text-sm text-text-muted">{error}</p>
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
