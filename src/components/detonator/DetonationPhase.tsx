"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import gsap from "gsap";
import type { ScannedService } from "@/hooks/useDetonation";
import { useAudio } from "@/hooks/useAudio";

interface DetonationPhaseProps {
  services: ScannedService[];
  selectedServiceIds: Set<string>;
  apiDone: boolean;
  onComplete: () => void;
}

export default function DetonationPhase({
  services,
  selectedServiceIds,
  apiDone,
  onComplete,
}: DetonationPhaseProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [dissolvedSet, setDissolvedSet] = useState<Set<string>>(new Set());
  const [animationDone, setAnimationDone] = useState(false);
  const { playTone } = useAudio();

  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.has(s.serviceId)),
    [services, selectedServiceIds]
  );

  // Stable ref for the playTone function to avoid effect re-runs
  const playToneRef = useRef(playTone);
  playToneRef.current = playTone;

  const runTimeline = useCallback(() => {
    if (timelineRef.current || selectedServices.length === 0) return;

    const tl = gsap.timeline();
    timelineRef.current = tl;

    selectedServices.forEach((service, i) => {
      const card = cardRefs.current[i];
      if (!card) return;

      tl.call(
        () => {
          setDissolvedSet((prev) => new Set([...prev, service.serviceId]));
          // Percussive hit: sawtooth 80Hz 300ms vol 0.12 + sine 40Hz 500ms vol 0.06
          playToneRef.current(80, 0.3, "sawtooth", 0.12);
          setTimeout(() => playToneRef.current(40, 0.5, "sine", 0.06), 50);
        },
        [],
        i * 0.6
      );

      tl.to(
        card,
        {
          opacity: 0,
          filter: "blur(8px)",
          scale: 0.95,
          y: -10,
          duration: 0.8,
          ease: "power2.out",
        },
        i * 0.6
      );
    });

    // 1s silence after last dissolution
    tl.call(
      () => {
        setAnimationDone(true);
      },
      [],
      `+=${1.0}`
    );
  }, [selectedServices]);

  useEffect(() => {
    runTimeline();
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [runTimeline]);

  // Transition when both animation and API are done
  useEffect(() => {
    if (animationDone && apiDone) {
      onComplete();
    }
  }, [animationDone, apiDone, onComplete]);

  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[680px]">
        {/* Header: 10px, letter-spacing 6px, #c41e1e, uppercase */}
        <p className="text-[10px] tracking-[6px] text-accent-red mb-8 uppercase">
          Detonation in progress
        </p>

        <div className="flex flex-col gap-1.5" role="list" aria-label="Detonation progress">
          {selectedServices.map((service, i) => (
            <div
              key={service.serviceId}
              role="listitem"
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="flex items-center gap-3 px-4 py-3 border border-border cursor-default"
            >
              <span className="text-[10px] tracking-[2px] text-text-muted w-6 shrink-0 font-mono">
                {service.icon}
              </span>
              <span className="text-[13px] text-text-primary flex-1">
                {service.name}
              </span>
              <span
                className={`text-[10px] tracking-[2px] uppercase font-mono ${
                  dissolvedSet.has(service.serviceId)
                    ? "text-accent-red"
                    : "text-text-ghost"
                }`}
              >
                {dissolvedSet.has(service.serviceId) ? "SENT" : "PENDING"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
