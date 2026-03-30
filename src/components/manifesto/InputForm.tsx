"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type FormState = "idle" | "submitting" | "sent" | "error";

export default function InputForm() {
  const t = useTranslations("landing.form");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = isValidEmail && formState === "idle";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setFormState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone: phone || undefined,
          turnstileToken: turnstileToken || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error || `Request failed (${response.status})`
        );
      }

      setFormState("sent");
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  }

  if (formState === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <p className="mb-4 font-display text-lg italic text-text-primary">
          {t("sentTitle")}
        </p>
        <p className="font-mono text-[13px] leading-relaxed text-text-dim">
          {t.rich("sentDescription", {
            email,
            highlight: (chunks) => (
              <span className="text-text-secondary">{chunks}</span>
            ),
          })}
          <br />
          {t("sentInstruction")}
          <br />
          {t("sentExpiry")}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      noValidate
    >
      <div className="mb-8">
        <label
          htmlFor="email"
          className="mb-1 block font-mono text-[10px] uppercase tracking-[3px] text-text-muted"
        >
          {t("emailLabel")}
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-0 border-b border-text-ghost bg-transparent px-0 py-3 font-mono text-base sm:text-[14px] text-text-primary outline-none transition-[border-color] duration-300 placeholder:text-text-dim focus:border-accent-red"
          autoComplete="email"
        />
      </div>

      <div className="mb-10">
        <label
          htmlFor="phone"
          className="mb-1 block font-mono text-[10px] uppercase tracking-[3px] text-text-muted"
        >
          {t("phoneLabel")}{" "}
          <span className="tracking-normal text-text-ghost">
            {t("phoneOptional")}
          </span>
        </label>
        <input
          id="phone"
          type="tel"
          placeholder={t("phonePlaceholder")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border-0 border-b border-text-ghost bg-transparent px-0 py-3 font-mono text-base sm:text-[14px] text-text-primary outline-none transition-[border-color] duration-300 placeholder:text-text-dim focus:border-accent-red"
          autoComplete="tel"
        />
      </div>

      {/* Turnstile invisible widget mount point */}
      <div
        id="turnstile-container"
        data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
        data-theme="dark"
        data-size="invisible"
        data-callback="onTurnstileSuccess"
        ref={(el) => {
          if (typeof window !== "undefined" && el) {
            // @ts-expect-error — Turnstile callback set on window
            window.onTurnstileSuccess = (token: string) =>
              setTurnstileToken(token);
          }
        }}
      />

      <p className="mb-6 font-mono text-[11px] leading-relaxed text-text-ghost">
        {t.rich("consent", {
          privacy: (chunks) => (
            <Link
              href="/about/privacy"
              className="text-text-muted underline hover:text-text-secondary"
            >
              {chunks}
            </Link>
          ),
          terms: (chunks) => (
            <Link
              href="/about/terms"
              className="text-text-muted underline hover:text-text-secondary"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>

      {errorMessage && (
        <p className="mb-4 font-mono text-xs text-accent-red" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        aria-label={t("submitAriaLabel")}
        className="border border-text-primary bg-transparent px-8 py-3.5 font-display text-sm uppercase tracking-[4px] text-text-primary transition-all hover:tracking-[6px] disabled:cursor-not-allowed disabled:opacity-30"
      >
        {formState === "submitting" ? t("submitting") : t("submit")}
      </button>
    </motion.form>
  );
}
