"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

export default function MuteToggle() {
  const t = useTranslations("common");
  const [muted, setMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("deindex-muted");
    if (stored === "true") setMuted(true);
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem("deindex-muted", String(next));
      return next;
    });
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-label={muted ? t("unmuteAriaLabel") : t("muteAriaLabel")}
      className="fixed top-4 right-4 z-[200] border border-text-ghost bg-transparent px-2.5 py-1.5 font-mono text-[11px] tracking-[2px] text-[#666] transition-colors hover:border-[#666] hover:text-text-primary"
    >
      {muted ? t("unmute") : t("mute")}
    </button>
  );
}
