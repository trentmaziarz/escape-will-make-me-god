"use client";

import { useState } from "react";

interface ScanResult {
  services: string[];
  breaches: string[];
}

export function useScan() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult | null>(null);

  async function startScan(email: string, phone: string) {
    setScanning(true);
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });
      const data = await response.json();
      setResults(data);
    } finally {
      setScanning(false);
    }
  }

  return { scanning, results, startScan };
}
