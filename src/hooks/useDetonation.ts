"use client";

import { useCallback, useState } from "react";

export interface ScannedService {
  serviceId: string;
  confidence: number;
  source: string;
  name: string;
  icon: string;
  category: string;
  deletionDifficulty: "auto" | "easy" | "medium" | "hard";
  deletionMethod: "auto-api" | "auto-email" | "user-email" | "manual-guide";
}

export interface DetonationResults {
  requestsSent: number;
  guidesGenerated: number;
  reportEmailed: boolean;
}

export type DetonationPhase =
  | "idle"
  | "scanning"
  | "review"
  | "detonating"
  | "complete";

export function useDetonation(token: string) {
  const [phase, setPhase] = useState<DetonationPhase>("idle");
  const [discoveredServices, setDiscoveredServices] = useState<
    ScannedService[]
  >([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(
    new Set()
  );
  const [results, setResults] = useState<DetonationResults | null>(null);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [scanPartial, setScanPartial] = useState(false);
  const [hibpError, setHibpError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  const startScan = useCallback(async () => {
    if (!token) return;
    setPhase("scanning");
    setError(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          setTokenInvalid(true);
        }
        throw new Error(data.error || `Scan failed (${res.status})`);
      }

      const data = await res.json();
      setDiscoveredServices(data.services);
      setSelectedServiceIds(
        new Set(
          data.services
            .filter((s: ScannedService) => s.source === "hibp")
            .map((s: ScannedService) => s.serviceId)
        )
      );
      setMaskedEmail(data.maskedEmail ?? "");
      setScanPartial(data.partial ?? false);
      setHibpError(data.hibpError ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
      setPhase("idle");
    }
  }, [token]);

  const toggleService = useCallback((id: string) => {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedServiceIds(
      new Set(discoveredServices.map((s) => s.serviceId))
    );
  }, [discoveredServices]);

  const deselectAll = useCallback(() => {
    setSelectedServiceIds(new Set());
  }, []);

  const detonate = useCallback(async () => {
    if (selectedServiceIds.size === 0) return;
    setPhase("detonating");
    setError(null);

    try {
      const res = await fetch("/api/detonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          selectedServiceIds: Array.from(selectedServiceIds),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Detonation failed (${res.status})`);
      }

      const data = await res.json();
      setResults({
        requestsSent: data.requestsSent,
        guidesGenerated: data.guidesGenerated,
        reportEmailed: data.reportEmailed,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Detonation failed");
      setResults({ requestsSent: 0, guidesGenerated: 0, reportEmailed: false });
    }
  }, [token, selectedServiceIds]);

  const goToReview = useCallback(() => setPhase("review"), []);
  const goToComplete = useCallback(() => setPhase("complete"), []);

  return {
    phase,
    discoveredServices,
    selectedServiceIds,
    results,
    maskedEmail,
    scanPartial,
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
  };
}
