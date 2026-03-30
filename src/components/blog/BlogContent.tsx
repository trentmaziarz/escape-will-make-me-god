"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function BlogContent() {
  const t = useTranslations("blog");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6"
    >
      <div className="mx-auto w-full max-w-[680px] text-center">
        <h1 className="font-display text-[clamp(32px,6vw,56px)] font-black leading-[1.05] tracking-[-1px] text-text-primary mb-2">
          {t("title")}
        </h1>
        <p className="text-[10px] text-text-muted tracking-[2px] uppercase mb-16">
          {t("subtitle")}
        </p>

        <div className="mb-16">
          <p className="font-display text-[clamp(18px,3vw,24px)] font-normal italic text-text-muted leading-[1.6] mb-2">
            {t("comingSoonQuote")}
          </p>
          <p className="text-[13px] text-text-dim leading-[1.8]">
            {t("comingSoonDescription")}
          </p>
        </div>

        {submitted ? (
          <div className="border border-border px-6 py-5">
            <p className="text-[13px] text-text-secondary">
              {t("submittedTitle")}
            </p>
            <p className="text-[11px] text-text-ghost mt-2">
              {t("submittedNote")}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="inline-flex flex-col sm:flex-row gap-0 w-full max-w-[480px]"
          >
            <label htmlFor="blog-email" className="sr-only">
              {t("emailAriaLabel")}
            </label>
            <input
              id="blog-email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-transparent border border-border px-4 py-3 text-[16px] sm:text-[13px] text-text-primary font-mono outline-none placeholder:text-text-ghost focus:border-text-dim transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 border border-accent-red text-[10px] tracking-[4px] uppercase text-accent-red hover:bg-accent-red hover:text-bg-primary transition-colors sm:border-l-0"
            >
              {t("notifyMe")}
            </button>
          </form>
        )}

        <p className="mt-4 text-[11px] text-text-ghost">{t("noSpam")}</p>
      </div>
    </main>
  );
}
