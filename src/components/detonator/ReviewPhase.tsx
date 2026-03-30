"use client";

import { motion } from "framer-motion";
import type { ScannedService } from "@/hooks/useDetonation";

interface ReviewPhaseProps {
  services: ScannedService[];
  selectedServiceIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDetonate: () => void;
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

export default function ReviewPhase({
  services,
  selectedServiceIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onDetonate,
}: ReviewPhaseProps) {
  const selectedCount = selectedServiceIds.size;

  return (
    <div className="flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[680px]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="font-display text-[28px] font-bold text-text-primary mb-2">
            Target list
          </h2>
          <div className="flex items-center justify-between mb-8">
            <p className="text-xs text-text-muted tracking-[1px]">
              {selectedCount} service{selectedCount !== 1 ? "s" : ""} selected
              for deletion. Tap to deselect.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onSelectAll}
                className="text-[10px] text-text-ghost tracking-[1px] hover:text-text-muted transition-colors"
                type="button"
              >
                ALL
              </button>
              <button
                onClick={onDeselectAll}
                className="text-[10px] text-text-ghost tracking-[1px] hover:text-text-muted transition-colors"
                type="button"
              >
                NONE
              </button>
            </div>
          </div>

          {/* Service cards */}
          <div
            className="flex flex-col gap-1.5 mb-12"
            role="list"
            aria-label="Services for deletion"
          >
            {services.map((service) => {
              const selected = selectedServiceIds.has(service.serviceId);
              return (
                <button
                  key={service.serviceId}
                  role="listitem"
                  onClick={() => onToggle(service.serviceId)}
                  type="button"
                  className={`flex items-center gap-3 px-3 py-2.5 border text-left transition-colors ${
                    selected
                      ? "border-border hover:border-border-hover"
                      : "border-bg-elevated opacity-40 hover:opacity-60"
                  }`}
                >
                  <div
                    className={`w-4 h-4 border flex items-center justify-center shrink-0 ${
                      selected ? "border-accent-red" : "border-text-ghost"
                    }`}
                    aria-hidden="true"
                  >
                    {selected && (
                      <span className="text-[10px] text-accent-red">×</span>
                    )}
                  </div>
                  <span className="text-sm w-6 shrink-0" aria-hidden="true">
                    {service.icon}
                  </span>
                  <span className="text-[13px] text-text-primary flex-1">
                    {service.name}
                  </span>
                  <span
                    className={`text-[9px] tracking-[1px] border px-1.5 py-0.5 ${difficultyColor[service.deletionDifficulty]}`}
                  >
                    {difficultyLabel[service.deletionDifficulty]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detonate button */}
          <div className="text-center">
            <button
              onClick={onDetonate}
              disabled={selectedCount === 0}
              type="button"
              className="px-10 py-4 border-2 border-accent-red font-display text-lg tracking-[6px] text-accent-red uppercase transition-all hover:tracking-[12px] hover:bg-accent-red-dim animate-pulse-red disabled:opacity-30 disabled:animate-none disabled:cursor-not-allowed"
            >
              Detonate
            </button>
            <p className="text-[10px] text-text-ghost tracking-[2px] mt-4">
              THIS ACTION IS IRREVERSIBLE
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
