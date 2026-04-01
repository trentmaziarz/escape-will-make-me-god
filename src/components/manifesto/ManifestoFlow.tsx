"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import ManifestoText from "./ManifestoText";

const InputForm = dynamic(() => import("./InputForm"), { ssr: false });

export default function ManifestoFlow() {
  const t = useTranslations("landing");
  const [showManifesto, setShowManifesto] = useState(false);
  const [manifestoComplete, setManifestoComplete] = useState(false);
  const [autoSkip, setAutoSkip] = useState(false);
  const [skip, setSkip] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // Check localStorage for returning visitor, set visited flag
  useEffect(() => {
    const visited = localStorage.getItem("deindex-visited") === "true";
    localStorage.setItem("deindex-visited", "true");
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);

    if (visited) {
      setAutoSkip(true);
      setShowManifesto(true);
    } else {
      const timer = setTimeout(() => setShowManifesto(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Skip on click or keypress during animation
  const isAnimating = showManifesto && !manifestoComplete && !autoSkip;

  const handleSkip = useCallback(() => {
    setSkip(true);
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };

    document.addEventListener("click", handleSkip);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", handleSkip);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isAnimating, handleSkip]);

  return (
    <>
      {/* Title — static, no animation, so it is the LCP element at FCP time */}
      <div className="mb-12">
        <h1 className="font-display text-[clamp(32px,6vw,56px)] font-black leading-[1.05] tracking-[-1px] text-text-primary mb-2">
          {t("title")}
          <span className="text-accent-red">{t("titleAccent")}</span>
        </h1>
        <p className="font-mono text-[11px] uppercase tracking-[4px] text-text-muted">
          {t("tagline")}
        </p>
      </div>

      {/* Manifesto lines */}
      {showManifesto && (
        <ManifestoText
          onComplete={() => setManifestoComplete(true)}
          autoSkip={autoSkip}
          skip={skip}
        />
      )}

      {/* Skip indicator — fades out on skip/complete */}
      <AnimatePresence>
        {isAnimating && !skip && (
          <motion.div
            key="skip-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 font-mono text-[10px] text-text-ghost tracking-[2px] uppercase pointer-events-none"
            aria-hidden="true"
          >
            {isTouch ? t("skip.tap") : t("skip.click")}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input form — lazy loaded, fades up after manifesto completes */}
      {manifestoComplete && <InputForm />}
    </>
  );
}
