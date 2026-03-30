"use client";

import { useState } from "react";
import type { Metadata } from "next";
import Link from "next/link";

const SUGGESTED_AMOUNTS = [
  { label: "$5", cents: 500 },
  { label: "$10", cents: 1000 },
  { label: "$25", cents: 2500 },
];

export default function DonatePage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check URL params for success/cancel
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const success = params?.get("success") === "true";
  const cancelled = params?.get("cancelled") === "true";

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
      setError("Failed to connect. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mx-auto w-full max-w-[680px] text-center">
          <h1 className="font-display text-[clamp(32px,6vw,56px)] font-black leading-[1.05] tracking-[-1px] text-text-primary mb-6">
            Thank You
          </h1>
          <p className="text-[15px] text-text-secondary leading-[1.8] mb-4">
            Your support keeps this platform free, open source, and uncompromised.
          </p>
          <p className="text-[13px] text-text-muted leading-[1.8] mb-12">
            No receipt will be stored on our end. Stripe handles everything.
            We never see your payment details.
          </p>
          <Link
            href="/"
            className="inline-block text-[10px] tracking-[4px] uppercase px-8 py-3 border border-text-muted text-text-muted hover:border-text-primary hover:text-text-primary transition-colors"
          >
            Return to Manifesto
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[680px]">
        {/* Header */}
        <h1 className="font-display text-[clamp(32px,6vw,56px)] font-black leading-[1.05] tracking-[-1px] text-text-primary mb-2">
          Support the Cause
        </h1>
        <p className="font-display text-[clamp(14px,2.5vw,18px)] font-normal italic text-text-muted mb-10">
          Free forever. Open source. Funded by people who give a damn.
        </p>

        {cancelled && (
          <div className="mb-8 border border-text-dim px-4 py-3 text-[13px] text-text-muted">
            Donation cancelled. No charge was made.
          </div>
        )}

        {/* Transparency */}
        <div className="mb-12">
          <h2 className="text-[10px] tracking-[4px] uppercase text-text-ghost mb-6">
            Where your money goes
          </h2>
          <div className="space-y-3 text-[13px] text-text-secondary leading-[1.8]">
            <p>
              <span className="text-text-primary">Hosting &amp; infrastructure.</span>{" "}
              Servers, domains, email delivery, API costs.
            </p>
            <p>
              <span className="text-text-primary">HIBP API access.</span>{" "}
              The breach database that powers account discovery.
            </p>
            <p>
              <span className="text-text-primary">Development.</span>{" "}
              Expanding the service database. Building new scanners. Staying ahead of dark patterns.
            </p>
            <p>
              <span className="text-text-primary">Legal.</span>{" "}
              Template review, compliance research, fighting back when companies ignore deletion requests.
            </p>
          </div>
        </div>

        {/* Amount Selection */}
        <div className="mb-8">
          <h2 className="text-[10px] tracking-[4px] uppercase text-text-ghost mb-6">
            Choose an amount
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
              Custom
            </button>
          </div>

          {isCustom && (
            <div className="flex items-center border border-border">
              <span className="px-4 py-3 text-[15px] text-text-muted border-r border-border">$</span>
              <input
                type="number"
                min="1"
                max="1000"
                step="1"
                placeholder="Amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setError(null);
                }}
                className="flex-1 bg-transparent px-4 py-3 text-[15px] text-text-primary font-mono outline-none placeholder:text-text-ghost"
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="mb-4 text-[13px] text-accent-red">{error}</p>
        )}

        {/* Donate Button */}
        <button
          onClick={handleDonate}
          disabled={loading || !getAmountCents()}
          className="w-full py-4 text-[11px] tracking-[4px] uppercase border border-accent-red text-accent-red hover:bg-accent-red hover:text-bg-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent-red"
        >
          {loading ? "Redirecting to Stripe..." : "Donate"}
        </button>

        {/* Fine print */}
        <p className="mt-6 text-[11px] text-text-ghost leading-[1.8] text-center">
          Processed securely by Stripe. We never see or store your payment details.
          <br />
          DEINDEX.ME is open source under MIT license.
        </p>

        {/* Philosophy */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-[13px] text-text-muted leading-[1.8] italic font-display">
            &ldquo;We will never run ads. We will never sell data. We will never put
            this behind a paywall. If you believe the internet should have an eject
            button, help us keep building one.&rdquo;
          </p>
        </div>
      </div>
    </main>
  );
}
