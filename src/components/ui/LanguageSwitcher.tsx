"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/config";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
  de: "DE",
  es: "ES",
  it: "IT",
  nl: "NL",
  pt: "PT",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(newLocale: Locale) {
    setOpen(false);
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="text-[9px] tracking-[2px] uppercase text-text-muted hover:text-text-secondary transition-colors"
      >
        {LOCALE_LABELS[locale as Locale] ?? locale.toUpperCase()}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className="absolute bottom-full left-0 mb-1 border border-border bg-bg-primary py-1 min-w-[48px] z-[300]"
        >
          {locales.map((loc) => (
            <li key={loc} role="option" aria-selected={loc === locale}>
              <button
                onClick={() => switchLocale(loc)}
                className={`block w-full px-3 py-1 text-[9px] tracking-[2px] uppercase text-left transition-colors ${
                  loc === locale
                    ? "text-accent-red"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {LOCALE_LABELS[loc]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
