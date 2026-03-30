"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useDetonation } from "@/hooks/useDetonation";
import { useScan } from "@/hooks/useScan";
import ScanPhase from "./ScanPhase";
import ReviewPhase from "./ReviewPhase";
import DetonationPhase from "./DetonationPhase";
import CompletePhase from "./CompletePhase";

export default function DetonatorFlow() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const scanStarted = useRef(false);

  const {
    phase,
    discoveredServices,
    selectedServiceIds,
    results,
    maskedEmail,
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

  // Start scan on mount
  useEffect(() => {
    if (token && !scanStarted.current) {
      scanStarted.current = true;
      startScan();
    }
  }, [token, startScan]);

  // Start progressive reveal when services arrive
  useEffect(() => {
    if (discoveredServices.length > 0 && phase === "scanning") {
      startReveal();
    }
  }, [discoveredServices, phase, startReveal]);

  // Transition to review after reveal completes
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
            Invalid Link
          </h1>
          <p className="text-sm text-text-muted">
            This detonation link is invalid or has expired.
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
            Error
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
