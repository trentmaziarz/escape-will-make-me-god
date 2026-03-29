"use client";

import { useState } from "react";

type DetonationPhase = "idle" | "scan" | "review" | "detonating" | "complete";

export function useDetonation() {
  const [phase, setPhase] = useState<DetonationPhase>("idle");
  const [services, setServices] = useState<string[]>([]);

  return { phase, setPhase, services, setServices };
}
