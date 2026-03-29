"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";

const MANIFESTO_LINES = [
  "You are the product.",
  "Every click, every scroll, every pause — catalogued.",
  "Your face is in databases you've never heard of.",
  "Your phone number is for sale. Right now.",
  "Data brokers know your home address, your salary, your habits.",
  "They don't need your permission.",
  "They already have everything.",
  "",
  "But you have something they don't expect.",
  "The right to disappear.",
  "",
  "GDPR Article 17. CCPA Section 1798.105.",
  "The law says they must delete you.",
  "They're counting on you never asking.",
  "",
  "Stop counting.",
];

interface LineStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  fontStyle: string;
  color: string;
}

function getLineStyle(line: string): LineStyle {
  if (line === "Stop counting.") {
    return {
      fontFamily: "var(--font-mono)",
      fontSize: "28px",
      fontWeight: 900,
      fontStyle: "normal",
      color: "var(--accent-red)",
    };
  }
  if (line.startsWith("GDPR") || line.startsWith("The law")) {
    return {
      fontFamily: "var(--font-mono)",
      fontSize: "13px",
      fontWeight: 400,
      fontStyle: "normal",
      color: "var(--text-secondary)",
    };
  }
  if (line.startsWith("But you")) {
    return {
      fontFamily: "var(--font-display)",
      fontSize: "18px",
      fontWeight: 400,
      fontStyle: "italic",
      color: "#c8b89a",
    };
  }
  if (line === "They already have everything.") {
    return {
      fontFamily: "var(--font-display)",
      fontSize: "18px",
      fontWeight: 700,
      fontStyle: "normal",
      color: "var(--text-primary)",
    };
  }
  return {
    fontFamily: "var(--font-display)",
    fontSize: "18px",
    fontWeight: 400,
    fontStyle: "normal",
    color: "var(--text-primary)",
  };
}

interface ManifestoTextProps {
  onComplete: () => void;
}

export default function ManifestoText({ onComplete }: ManifestoTextProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const { playTone } = useAudio();

  const advance = useCallback(() => {
    setVisibleCount((prev) => {
      const next = prev + 1;
      if (next >= MANIFESTO_LINES.length) {
        onComplete();
      }
      return next;
    });
  }, [onComplete]);

  useEffect(() => {
    if (visibleCount >= MANIFESTO_LINES.length) return;

    const currentLine = MANIFESTO_LINES[visibleCount];
    const delay =
      currentLine === ""
        ? 400
        : 120 + currentLine.length * 30;

    const timer = setTimeout(() => {
      if (currentLine !== "") {
        playTone(200 + Math.random() * 100, 0.1, "sine", 0.02);
      }
      advance();
    }, delay);

    return () => clearTimeout(timer);
  }, [visibleCount, advance, playTone]);

  return (
    <div
      className="mb-12 min-h-[340px]"
      role="region"
      aria-label="Manifesto"
    >
      <AnimatePresence>
        {MANIFESTO_LINES.slice(0, visibleCount).map((line, i) => {
          if (line === "") {
            return <div key={i} className="mb-6" aria-hidden="true" />;
          }

          const style = getLineStyle(line);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-2.5 leading-relaxed"
              style={{
                fontFamily: style.fontFamily,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                fontStyle: style.fontStyle,
                color: style.color,
              }}
            >
              {line}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export { MANIFESTO_LINES };
