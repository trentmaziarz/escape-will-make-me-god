"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ScannedService } from "./useDetonation";
import { useAudio } from "./useAudio";

export function useScan(services: ScannedService[]) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRevealingRef = useRef(false);
  const { playTone } = useAudio();

  const progress =
    services.length > 0
      ? Math.round((visibleCount / services.length) * 100)
      : 0;

  const visibleServices = services.slice(0, visibleCount);

  const startReveal = useCallback(() => {
    if (services.length === 0 || isRevealingRef.current) return;
    isRevealingRef.current = true;
    setIsRevealing(true);
    setVisibleCount(0);

    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i < services.length) {
        setVisibleCount(i + 1);
        playTone(300 + i * 40, 0.15, "triangle", 0.04);
        i++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        isRevealingRef.current = false;
        setIsRevealing(false);
      }
    }, 400);
  }, [services, playTone]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const isComplete =
    !isRevealing && visibleCount === services.length && services.length > 0;

  return {
    visibleServices,
    visibleCount,
    progress,
    isRevealing,
    isComplete,
    startReveal,
  };
}
