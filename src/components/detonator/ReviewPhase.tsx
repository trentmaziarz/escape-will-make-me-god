"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ScannedService } from "@/hooks/useDetonation";

interface ReviewPhaseProps {
  services: ScannedService[];
  selectedServiceIds: Set<string>;
  hibpError: boolean;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDetonate: () => void;
}

const difficultyColor: Record<ScannedService["deletionDifficulty"], string> = {
  auto: "text-difficulty-auto border-difficulty-auto",
  easy: "text-difficulty-easy border-difficulty-easy",
  medium: "text-difficulty-medium border-difficulty-medium",
  hard: "text-difficulty-hard border-difficulty-hard",
};

function ServiceRow({
  service,
  selected,
  onToggle,
  t,
}: {
  service: ScannedService;
  selected: boolean;
  onToggle: (id: string) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <button
      role="listitem"
      aria-label={
        selected
          ? t("review.serviceSelectedAria", { name: service.name })
          : t("review.serviceNotSelectedAria", { name: service.name })
      }
      onClick={() => onToggle(service.serviceId)}
      type="button"
      className={`flex items-center gap-3 px-4 py-3 border text-left transition-all duration-300 cursor-pointer ${
        selected
          ? "border-accent-red bg-accent-red-dim"
          : "border-border hover:border-border-hover"
      }`}
    >
      <div
        className={`w-4 h-4 border flex items-center justify-center shrink-0 ${
          selected ? "border-accent-red" : "border-text-ghost"
        }`}
        aria-hidden="true"
      >
        {selected && (
          <span className="text-[10px] text-accent-red">&times;</span>
        )}
      </div>
      <span className="text-[10px] tracking-[2px] text-text-muted w-6 shrink-0 font-mono">
        {service.icon}
      </span>
      <span className="text-[13px] text-text-primary flex-1">
        {service.name}
      </span>
      <span
        className={`text-[9px] tracking-[2px] uppercase px-1.5 py-0.5 border ${difficultyColor[service.deletionDifficulty]}`}
      >
        {t(`reviewDifficulty.${service.deletionDifficulty}`)}
      </span>
    </button>
  );
}

export default function ReviewPhase({
  services,
  selectedServiceIds,
  hibpError,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onDetonate,
}: ReviewPhaseProps) {
  const t = useTranslations("detonator");
  const selectedCount = selectedServiceIds.size;

  const { confirmed, suggestions } = useMemo(() => {
    const conf: ScannedService[] = [];
    const sugg: ScannedService[] = [];
    for (const svc of services) {
      if (svc.source === "hibp") {
        conf.push(svc);
      } else {
        sugg.push(svc);
      }
    }
    return { confirmed: conf, suggestions: sugg };
  }, [services]);

  const hasConfirmed = confirmed.length > 0;

  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[680px]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="font-display text-[28px] font-bold text-text-primary mb-2">
            {t("review.title")}
          </h2>
          <div className="flex items-center justify-between mb-8">
            <p className="text-xs text-text-muted tracking-[1px]">
              {t("review.subtitle", { count: selectedCount })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onSelectAll}
                aria-label={t("review.selectAllAriaLabel")}
                className="text-[10px] text-text-ghost tracking-[1px] hover:text-text-muted transition-colors"
                type="button"
              >
                {t("review.all")}
              </button>
              <button
                onClick={onDeselectAll}
                aria-label={t("review.deselectAllAriaLabel")}
                className="text-[10px] text-text-ghost tracking-[1px] hover:text-text-muted transition-colors"
                type="button"
              >
                {t("review.none")}
              </button>
            </div>
          </div>

          {/* --- Confirmed accounts (HIBP) --- */}
          {hasConfirmed && (
            <div className="mb-10">
              <h3 className="text-[10px] tracking-[4px] text-accent-red uppercase mb-1">
                {t("review.confirmedTitle")}
              </h3>
              <p className="text-[11px] text-text-dim mb-4">
                {t("review.confirmedSubtitle")}
              </p>
              <div
                className="flex flex-col gap-1.5"
                role="list"
                aria-label="Confirmed accounts"
              >
                {confirmed.map((service) => (
                  <ServiceRow
                    key={service.serviceId}
                    service={service}
                    selected={selectedServiceIds.has(service.serviceId)}
                    onToggle={onToggle}
                    t={t}
                  />
                ))}
              </div>
            </div>
          )}

          {/* --- Contextual note when no confirmed results --- */}
          {!hasConfirmed && (
            <p className="text-[11px] text-text-dim mb-6">
              {hibpError
                ? t("review.hibpErrorNote")
                : t("review.noConfirmedNote")}
            </p>
          )}

          {/* --- Suggestions (database) --- */}
          {suggestions.length > 0 && (
            <div className="mb-12">
              {hasConfirmed && (
                <>
                  <h3 className="text-[10px] tracking-[4px] text-text-muted uppercase mb-1">
                    {t("review.suggestionsTitle")}
                  </h3>
                  <p className="text-[11px] text-text-dim mb-4">
                    {t("review.suggestionsSubtitle")}
                  </p>
                </>
              )}
              <div
                className="flex flex-col gap-1.5"
                role="list"
                aria-label="Suggested services"
              >
                {suggestions.map((service) => (
                  <ServiceRow
                    key={service.serviceId}
                    service={service}
                    selected={selectedServiceIds.has(service.serviceId)}
                    onToggle={onToggle}
                    t={t}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={onDetonate}
              disabled={selectedCount === 0}
              type="button"
              className="bg-transparent px-12 py-5 border-2 border-accent-red font-display text-lg tracking-[6px] text-accent-red uppercase transition-all duration-300 animate-pulse-red hover:bg-accent-red hover:text-bg-primary hover:tracking-[10px] disabled:opacity-30 disabled:animate-none disabled:cursor-not-allowed"
            >
              {t("review.detonate")}
            </button>
            <p className="text-[10px] text-text-ghost tracking-[2px] mt-4">
              {t("review.warning")}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
