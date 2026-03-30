"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ScannedService } from "@/hooks/useDetonation";

interface ScanPhaseProps {
  visibleServices: ScannedService[];
  progress: number;
  isRevealing: boolean;
  maskedEmail: string;
}

const difficultyColor: Record<ScannedService["deletionDifficulty"], string> = {
  auto: "text-difficulty-auto",
  easy: "text-difficulty-easy",
  medium: "text-difficulty-medium",
  hard: "text-difficulty-hard",
};

export default function ScanPhase({
  visibleServices,
  progress,
  maskedEmail,
}: ScanPhaseProps) {
  const t = useTranslations("detonator");

  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[680px]">
        <h2 className="text-[10px] tracking-[4px] text-text-muted mb-6 uppercase">
          {t("scanning.title")}
        </h2>

        <div
          className="h-[2px] w-full bg-bg-elevated mb-8 overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("scanning.progressAriaLabel", { progress })}
        >
          <div
            className="h-full bg-accent-red transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="font-mono text-xs text-text-dim mb-8">
          {t("scanning.progress", { maskedEmail, progress })}
        </p>

        <div
          className="flex flex-col"
          role="list"
          aria-label="Discovered services"
        >
          {visibleServices.map((service, i) => (
            <motion.div
              key={service.serviceId}
              role="listitem"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-center gap-3 py-2 border-b border-[#151515]"
            >
              <span className="text-[10px] text-text-ghost w-5 text-right shrink-0 font-mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[10px] tracking-[2px] text-text-secondary w-6 shrink-0 font-mono">
                {service.icon}
              </span>
              <span className="text-[13px] text-text-primary flex-1">
                {service.name}
              </span>
              <span className="text-[10px] tracking-[1px] text-text-muted uppercase">
                {service.category.replace("-", " ")}
              </span>
              <span
                className={`text-[10px] tracking-[1px] uppercase ${difficultyColor[service.deletionDifficulty]}`}
              >
                {t(`scanDifficulty.${service.deletionDifficulty}`)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
