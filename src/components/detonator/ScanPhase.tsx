"use client";

import { motion } from "framer-motion";
import type { ScannedService } from "@/hooks/useDetonation";

interface ScanPhaseProps {
  visibleServices: ScannedService[];
  progress: number;
  isRevealing: boolean;
}

const difficultyLabel: Record<ScannedService["deletionDifficulty"], string> = {
  auto: "AUTO",
  easy: "GUIDED",
  medium: "EMAIL REQ",
  hard: "MANUAL",
};

const difficultyColor: Record<ScannedService["deletionDifficulty"], string> = {
  auto: "text-difficulty-auto border-difficulty-auto",
  easy: "text-difficulty-easy border-difficulty-easy",
  medium: "text-difficulty-medium border-difficulty-medium",
  hard: "text-difficulty-hard border-difficulty-hard",
};

export default function ScanPhase({
  visibleServices,
  progress,
  isRevealing,
}: ScanPhaseProps) {
  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[680px]">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
          Scanning
        </h2>
        <p className="text-xs text-text-muted tracking-[2px] mb-8 uppercase">
          Discovering your digital presence
        </p>

        {/* Progress bar */}
        <div className="h-[2px] w-full bg-bg-elevated mb-8">
          <div
            className="h-full bg-accent-red transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Service list */}
        <div className="flex flex-col gap-1.5" role="list" aria-label="Discovered services">
          {visibleServices.map((service, i) => (
            <motion.div
              key={service.serviceId}
              role="listitem"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center gap-3 px-3 py-2.5 border border-border"
            >
              <span className="text-xs text-text-ghost tracking-[2px] w-6 shrink-0 font-mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm w-6 shrink-0" aria-hidden="true">
                {service.icon}
              </span>
              <span className="text-[13px] text-text-primary flex-1">
                {service.name}
              </span>
              <span className="text-[9px] text-text-muted tracking-[1px] uppercase hidden sm:inline">
                {service.category.replace("-", " ")}
              </span>
              <span
                className={`text-[9px] tracking-[1px] border px-1.5 py-0.5 ${difficultyColor[service.deletionDifficulty]}`}
              >
                {difficultyLabel[service.deletionDifficulty]}
              </span>
            </motion.div>
          ))}
        </div>

        {isRevealing && (
          <div className="mt-6 text-center">
            <span className="text-xs text-text-ghost tracking-[3px] uppercase">
              {progress}% — Scanning...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
