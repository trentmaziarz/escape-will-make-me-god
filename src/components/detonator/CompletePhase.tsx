"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAudio } from "@/hooks/useAudio";
import type { DetonationResults } from "@/hooks/useDetonation";

interface CompletePhaseProps {
  results: DetonationResults;
  maskedEmail: string;
}

export default function CompletePhase({
  results,
  maskedEmail,
}: CompletePhaseProps) {
  const t = useTranslations("detonator.complete");
  const { playTone } = useAudio();
  const chordPlayed = useRef(false);

  useEffect(() => {
    if (chordPlayed.current) return;
    chordPlayed.current = true;

    const tones: [number, number, number][] = [
      [440, 2, 0.05],
      [554, 2, 0.04],
      [659, 3, 0.03],
    ];
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    tones.forEach(([freq, dur, vol], i) => {
      timeouts.push(
        setTimeout(() => {
          playTone(freq, dur, "sine", vol);
        }, i * 200)
      );
    });

    return () => timeouts.forEach(clearTimeout);
  }, [playTone]);

  const totalCount = results.requestsSent + results.guidesGenerated;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "easeOut" }}
      className="flex min-h-screen flex-col items-center justify-center px-4 py-10"
    >
      <div
        className="w-px h-20 mb-12"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--accent-red), transparent)",
        }}
      />

      <h2 className="font-display text-[clamp(24px,5vw,40px)] font-normal italic text-text-primary text-center mb-4 leading-tight">
        {t("title")}
      </h2>

      <p className="text-xs text-text-muted tracking-[3px] text-center mb-12 uppercase">
        {t("count", { count: totalCount })}
      </p>

      <p className="text-[13px] text-text-muted text-center max-w-[400px] leading-[1.8] mb-12">
        {t.rich("reportSent", {
          email: maskedEmail || "your email",
          highlight: (chunks) => (
            <span className="text-text-secondary">{chunks}</span>
          ),
        })}
        <br />
        <br />
        {t("forgotten")}
      </p>

      <div
        className="w-px h-20 mb-12"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--text-ghost), transparent)",
        }}
      />

      <a
        href="/donate"
        aria-label={t("supportAriaLabel")}
        className="font-mono text-[11px] text-text-muted tracking-[2px] hover:text-text-secondary transition-colors"
      >
        {t("supportCause")}
      </a>
    </motion.div>
  );
}
