"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAudio } from "@/hooks/useAudio";

type ManifestoEntry = { key: string } | { spacer: true };

const MANIFESTO_SEQUENCE: ManifestoEntry[] = [
  { key: "line1" },
  { key: "line2" },
  { key: "line3" },
  { key: "line4" },
  { key: "line5" },
  { key: "line6" },
  { key: "line7" },
  { spacer: true },
  { key: "line8" },
  { key: "line9" },
  { spacer: true },
  { key: "line10" },
  { key: "line11" },
  { key: "line12" },
  { spacer: true },
  { key: "line13" },
];

interface LineStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  fontStyle: string;
  color: string;
}

const LINE_STYLES: Record<string, LineStyle> = {
  line13: {
    fontFamily: "var(--font-mono)",
    fontSize: "28px",
    fontWeight: 900,
    fontStyle: "normal",
    color: "var(--accent-red)",
  },
  line10: {
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    fontWeight: 400,
    fontStyle: "normal",
    color: "var(--text-secondary)",
  },
  line11: {
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    fontWeight: 400,
    fontStyle: "normal",
    color: "var(--text-secondary)",
  },
  line8: {
    fontFamily: "var(--font-display)",
    fontSize: "18px",
    fontWeight: 400,
    fontStyle: "italic",
    color: "#c8b89a",
  },
  line7: {
    fontFamily: "var(--font-display)",
    fontSize: "18px",
    fontWeight: 700,
    fontStyle: "normal",
    color: "var(--text-primary)",
  },
};

const DEFAULT_STYLE: LineStyle = {
  fontFamily: "var(--font-display)",
  fontSize: "18px",
  fontWeight: 400,
  fontStyle: "normal",
  color: "var(--text-primary)",
};

interface ManifestoTextProps {
  onComplete: () => void;
}

export default function ManifestoText({ onComplete }: ManifestoTextProps) {
  const t = useTranslations("landing.manifesto");
  const [visibleCount, setVisibleCount] = useState(0);
  const { playTone } = useAudio();

  const advance = useCallback(() => {
    setVisibleCount((prev) => {
      const next = prev + 1;
      if (next >= MANIFESTO_SEQUENCE.length) {
        onComplete();
      }
      return next;
    });
  }, [onComplete]);

  useEffect(() => {
    if (visibleCount >= MANIFESTO_SEQUENCE.length) return;

    const entry = MANIFESTO_SEQUENCE[visibleCount];
    const isSpacer = "spacer" in entry;
    const text = isSpacer ? "" : t(entry.key);
    const delay = isSpacer ? 400 : 120 + text.length * 30;

    const timer = setTimeout(() => {
      if (!isSpacer) {
        playTone(200 + Math.random() * 100, 0.1, "sine", 0.02);
      }
      advance();
    }, delay);

    return () => clearTimeout(timer);
  }, [visibleCount, advance, playTone, t]);

  return (
    <div
      className="mb-12 min-h-[520px]"
      role="region"
      aria-label={t("ariaLabel")}
    >
      <AnimatePresence>
        {MANIFESTO_SEQUENCE.slice(0, visibleCount).map((entry, i) => {
          if ("spacer" in entry) {
            return <div key={i} className="mb-6" aria-hidden="true" />;
          }

          const style = LINE_STYLES[entry.key] || DEFAULT_STYLE;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-2.5 leading-normal"
              style={{
                fontFamily: style.fontFamily,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                fontStyle: style.fontStyle,
                color: style.color,
              }}
            >
              {t(entry.key)}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export { MANIFESTO_SEQUENCE };
