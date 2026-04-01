"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function RedirectToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("landing.redirect");
  const reason = searchParams.get("redirect");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reason === "no-token" || reason === "expired") {
      setVisible(true);

      // Clean the URL param without navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("redirect");
      window.history.replaceState({}, "", url.pathname);

      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [reason]);

  if (!visible || !reason) return null;

  const message =
    reason === "expired" ? t("expired") : t("noToken");

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 border border-text-ghost bg-bg-primary px-5 py-3 font-mono text-xs tracking-wide text-text-muted transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {message}
    </div>
  );
}
