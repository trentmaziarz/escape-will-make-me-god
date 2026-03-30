"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ManifestoText from "./ManifestoText";

const InputForm = dynamic(() => import("./InputForm"), { ssr: false });

export default function ManifestoFlow() {
  const [showManifesto, setShowManifesto] = useState(false);
  const [manifestoComplete, setManifestoComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowManifesto(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Title — static, no animation, so it is the LCP element at FCP time */}
      <div className="mb-12">
        <h1 className="font-display text-[clamp(32px,6vw,56px)] font-black leading-[1.05] tracking-[-1px] text-text-primary mb-2">
          DEINDEX<span className="text-accent-red">.ME</span>
        </h1>
        <p className="font-mono text-[11px] uppercase tracking-[4px] text-text-muted">
          Offline is the new luxury
        </p>
      </div>

      {/* Manifesto lines */}
      {showManifesto && (
        <ManifestoText onComplete={() => setManifestoComplete(true)} />
      )}

      {/* Input form — lazy loaded, fades up after manifesto completes */}
      {manifestoComplete && <InputForm />}
    </>
  );
}
