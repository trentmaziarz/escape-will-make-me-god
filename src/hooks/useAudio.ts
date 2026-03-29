"use client";

import { useCallback, useRef } from "react";

/**
 * Singleton AudioContext — shared across all hook instances.
 * Lazy-initialized on first user interaction to comply with autoplay policies.
 */
let sharedContext: AudioContext | null = null;

function getContext(): AudioContext {
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }
  if (sharedContext.state === "suspended") {
    sharedContext.resume();
  }
  return sharedContext;
}

function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("deindex-muted") === "true";
}

export type PlayTone = (
  frequency: number,
  duration: number,
  type?: OscillatorType,
  volume?: number
) => void;

export function useAudio() {
  const lastPlayRef = useRef(0);

  const playTone: PlayTone = useCallback(
    (
      frequency: number,
      duration: number,
      type: OscillatorType = "sine",
      volume = 0.05
    ) => {
      if (isMuted()) return;

      try {
        const ctx = getContext();
        const now = ctx.currentTime;

        // Debounce: skip if called within 10ms
        if (now - lastPlayRef.current < 0.01) return;
        lastPlayRef.current = now;

        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gain.gain.value = volume;
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(now);
        oscillator.stop(now + duration);
      } catch {
        // Silently fail — audio is non-critical
      }
    },
    []
  );

  return { playTone };
}

/** Reset shared context — only for testing. */
export function _resetAudioContext(): void {
  if (sharedContext) {
    sharedContext.close().catch(() => {});
    sharedContext = null;
  }
}
