"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const SUGGESTED_AMOUNTS = [
  { label: "$5", cents: 500 },
  { label: "$10", cents: 1000 },
  { label: "$25", cents: 2500 },
];

interface DonateContentProps {
  success: boolean;
  cancelled: boolean;
}

export default function DonateContent({
  success,
  cancelled,
}: DonateContentProps) {
  const t = useTranslations("donate");
  const [selected, setSelected] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getAmountCents(): number | null {
    if (isCustom) {
      const parsed = parseFloat(customAmount);
      if (isNaN(parsed) || parsed < 1) return null;
      return Math.round(parsed * 100);
    }
    return selected;
  }

  async function handleDonate() {
    const amount = getAmountCents();
    if (!amount) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError(t("failedToConnect"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main
        id="main-content"
        className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6"
      >
        <div className="mx-auto w-full max-w-[680px] text-center">
          <h1 className="font-display text-[clamp(32px,6vw,56px)] font-black leading-[1.05] tracking-[-1px] text-text-primary mb-6">
            {t("successTitle")}
          </h1>
          <p className="text-[15px] text-text-secondary leading-[1.8] mb-4">
            {t("successMessage")}
          </p>
          <p className="text-[13px] text-text-muted leading-[1.8] mb-12">
            {t("successReceipt")}
          </p>
          <Link
            href="/"
            className="inline-block text-[10px] tracking-[4px] uppercase px-8 py-3 border border-text-muted text-text-muted hover:border-text-primary hover:text-text-primary transition-colors"
          >
            {t("successReturn")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6"
    >
      <div className="mx-auto w-full max-w-[680px]">
        <h1 className="font-display text-[clamp(32px,6vw,56px)] font-black leading-[1.05] tracking-[-1px] text-text-primary mb-2">
          {t("title")}
        </h1>
        <p className="font-display text-[clamp(14px,2.5vw,18px)] font-normal italic text-text-muted mb-10">
          {t("subtitle")}
        </p>

        {cancelled && (
          <div className="mb-8 border border-text-dim px-4 py-3 text-[13px] text-text-muted">
            {t("cancelled")}
          </div>
        )}

        {/* Transparency */}
        <div className="mb-12">
          <h2 className="text-[10px] tracking-[4px] uppercase text-text-muted mb-6">
            {t("budgetHeading")}
          </h2>
          <div className="space-y-3 text-[13px] text-text-secondary leading-[1.8]">
            <p>
              <span className="text-text-primary">
                {t("budgetHostingLabel")}
              </span>{" "}
              {t("budgetHostingDescription")}
            </p>
            <p>
              <span className="text-text-primary">
                {t("budgetHibpLabel")}
              </span>{" "}
              {t("budgetHibpDescription")}
            </p>
            <p>
              <span className="text-text-primary">
                {t("budgetDevLabel")}
              </span>{" "}
              {t("budgetDevDescription")}
            </p>
            <p>
              <span className="text-text-primary">
                {t("budgetLegalLabel")}
              </span>{" "}
              {t("budgetLegalDescription")}
            </p>
          </div>
        </div>

        {/* Amount Selection */}
        <div className="mb-8">
          <h2 className="text-[10px] tracking-[4px] uppercase text-text-muted mb-6">
            {t("amountHeading")}
          </h2>
          <div className="flex gap-3 mb-4">
            {SUGGESTED_AMOUNTS.map(({ label, cents }) => (
              <button
                key={cents}
                onClick={() => {
                  setSelected(cents);
                  setIsCustom(false);
                  setError(null);
                }}
                className={`flex-1 py-3 text-[15px] font-mono border transition-colors ${
                  !isCustom && selected === cents
                    ? "border-accent-red text-accent-red bg-accent-red-dim"
                    : "border-border text-text-muted hover:border-text-dim hover:text-text-secondary"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => {
                setIsCustom(true);
                setSelected(null);
                setError(null);
              }}
              className={`flex-1 py-3 text-[15px] font-mono border transition-colors ${
                isCustom
                  ? "border-accent-red text-accent-red bg-accent-red-dim"
                  : "border-border text-text-muted hover:border-text-dim hover:text-text-secondary"
              }`}
            >
              {t("custom")}
            </button>
          </div>

          {isCustom && (
            <div className="flex items-center border border-border">
              <span
                className="px-4 py-3 text-[15px] text-text-muted border-r border-border"
                aria-hidden="true"
              >
                $
              </span>
              <label htmlFor="custom-amount" className="sr-only">
                {t("amountAriaLabel")}
              </label>
              <input
                id="custom-amount"
                type="number"
                min="1"
                max="1000"
                step="1"
                placeholder={t("amountPlaceholder")}
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setError(null);
                }}
                className="flex-1 bg-transparent px-4 py-3 text-[16px] sm:text-[15px] text-text-primary font-mono outline-none placeholder:text-text-ghost"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="mb-4 text-[13px] text-accent-red">{error}</p>
        )}

        <button
          onClick={handleDonate}
          disabled={loading || !getAmountCents()}
          aria-label={
            loading ? t("donateRedirectingAriaLabel") : t("donateAriaLabel")
          }
          className="w-full py-4 text-[11px] tracking-[4px] uppercase border border-accent-red text-accent-red hover:bg-accent-red hover:text-bg-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent-red"
        >
          {loading ? t("donateRedirecting") : t("donateButton")}
        </button>

        <p className="mt-6 text-[11px] text-text-ghost leading-[1.8] text-center">
          {t("finePrint")}
          <br />
          {t("finePrintLicense")}
        </p>

        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-[13px] text-text-muted leading-[1.8] italic font-display">
            {t("philosophy")}
          </p>
        </div>
      </div>
    </main>
  );
}
