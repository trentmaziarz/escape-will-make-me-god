"use client";

import { useState } from "react";
import type { Metadata } from "next";

export default function BlogPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // Placeholder — no backend for email collection yet
    setSubmitted(true);
  }

  return (
    <main id="main-content" className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[680px] text-center">
        {/* Header */}
        <h1 className="font-display text-[clamp(32px,6vw,56px)] font-black leading-[1.05] tracking-[-1px] text-text-primary mb-2">
          The Movement
        </h1>
        <p className="text-[10px] text-text-muted tracking-[2px] uppercase mb-16">
          Essays on surveillance, privacy, and digital resistance
        </p>

        {/* Coming soon */}
        <div className="mb-16">
          <p className="font-display text-[clamp(18px,3vw,24px)] font-normal italic text-text-muted leading-[1.6] mb-2">
            &ldquo;The movement is coming.&rdquo;
          </p>
          <p className="text-[13px] text-text-dim leading-[1.8]">
            Long-form essays on data brokers, surveillance capitalism, and the
            right to disappear. Written to arm you with knowledge, not sell you
            a product.
          </p>
        </div>

        {/* Email signup */}
        {submitted ? (
          <div className="border border-border px-6 py-5">
            <p className="text-[13px] text-text-secondary">
              Noted. We will reach out when the first essay drops.
            </p>
            <p className="text-[11px] text-text-ghost mt-2">
              We will not store this email beyond the mailing list. No spam. No tracking.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="inline-flex flex-col sm:flex-row gap-0 w-full max-w-[480px]">
            <label htmlFor="blog-email" className="sr-only">Email address</label>
            <input
              id="blog-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-transparent border border-border px-4 py-3 text-[16px] sm:text-[13px] text-text-primary font-mono outline-none placeholder:text-text-ghost focus:border-text-dim transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 border border-accent-red text-[10px] tracking-[4px] uppercase text-accent-red hover:bg-accent-red hover:text-bg-primary transition-colors sm:border-l-0"
            >
              Notify Me
            </button>
          </form>
        )}

        <p className="mt-4 text-[11px] text-text-ghost">
          No spam. No tracking. Just a heads-up when we publish.
        </p>
      </div>
    </main>
  );
}
