"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { ServiceEntry, ServiceCategory, DeletionDifficulty } from "@/data/services/schema";

interface ServiceDirectoryProps {
  services: ServiceEntry[];
}

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  "social-media": "SOCIAL MEDIA",
  "data-broker": "DATA BROKERS",
  "big-tech": "BIG TECH",
  shopping: "SHOPPING",
  "ad-network": "AD NETWORKS",
  other: "OTHER",
};

const DIFFICULTY_LABELS: Record<DeletionDifficulty, string> = {
  auto: "AUTO",
  easy: "EASY",
  medium: "MEDIUM",
  hard: "HARD",
};

const DIFFICULTY_COLORS: Record<DeletionDifficulty, string> = {
  auto: "text-difficulty-auto border-difficulty-auto",
  easy: "text-difficulty-easy border-difficulty-easy",
  medium: "text-difficulty-medium border-difficulty-medium",
  hard: "text-difficulty-hard border-difficulty-hard",
};

const METHOD_LABELS: Record<ServiceEntry["deletionMethod"], string> = {
  "auto-api": "API",
  "auto-email": "AUTO EMAIL",
  "user-email": "USER EMAIL",
  "manual-guide": "MANUAL",
};

export default function ServiceDirectory({ services }: ServiceDirectoryProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all");

  const categories = useMemo(() => {
    const cats = new Set<ServiceCategory>();
    for (const s of services) cats.add(s.category);
    return Array.from(cats).sort();
  }, [services]);

  const filtered = useMemo(() => {
    let result = services;

    if (activeCategory !== "all") {
      result = result.filter((s) => s.category === activeCategory);
    }

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.domain.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [services, search, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map<ServiceCategory, ServiceEntry[]>();
    for (const s of filtered) {
      const list = map.get(s.category) || [];
      list.push(s);
      map.set(s.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <div>
      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services..."
          aria-label="Search services"
          className="w-full bg-bg-surface border border-border px-4 py-3 text-[16px] sm:text-[13px] text-text-primary font-mono placeholder:text-text-ghost focus:outline-none focus:border-border-hover transition-colors"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Filter by category">
        <button
          role="tab"
          aria-selected={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
          type="button"
          className={`text-[10px] tracking-[2px] uppercase px-3 py-1.5 border transition-colors ${
            activeCategory === "all"
              ? "border-accent-red text-accent-red"
              : "border-border text-text-dim hover:text-text-muted hover:border-border-hover"
          }`}
        >
          ALL ({services.length})
        </button>
        {categories.map((cat) => {
          const count = services.filter((s) => s.category === cat).length;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              type="button"
              className={`text-[10px] tracking-[2px] uppercase px-3 py-1.5 border transition-colors ${
                activeCategory === cat
                  ? "border-accent-red text-accent-red"
                  : "border-border text-text-dim hover:text-text-muted hover:border-border-hover"
              }`}
            >
              {CATEGORY_LABELS[cat]} ({count})
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-[10px] text-text-ghost tracking-[2px] uppercase mb-6">
        {filtered.length} service{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Grouped service lists */}
      {filtered.length === 0 ? (
        <p className="text-[13px] text-text-muted py-12 text-center">
          No services match your search.
        </p>
      ) : (
        Array.from(grouped.entries()).map(([category, categoryServices]) => (
          <section key={category} className="mb-12">
            <h2 className="font-display text-[14px] font-bold text-text-muted tracking-[4px] uppercase mb-4 pb-2 border-b border-border">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="flex flex-col gap-1.5" role="list" aria-label={`${CATEGORY_LABELS[category]} services`}>
              {categoryServices.map((service, i) => (
                <motion.div
                  key={service.id}
                  role="listitem"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="flex items-center gap-3 px-4 py-3 border border-border hover:border-border-hover transition-colors"
                >
                  {/* Icon */}
                  <span className="text-[10px] tracking-[2px] text-text-muted w-6 shrink-0 font-mono">
                    {service.icon}
                  </span>

                  {/* Name + domain */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-text-primary block">
                      {service.name}
                    </span>
                    <span className="text-[10px] text-text-ghost tracking-[1px]">
                      {service.domain}
                    </span>
                  </div>

                  {/* Method */}
                  <span className="text-[9px] tracking-[2px] uppercase text-text-dim hidden sm:block">
                    {METHOD_LABELS[service.deletionMethod]}
                  </span>

                  {/* Response time */}
                  <span className="text-[9px] tracking-[1px] text-text-ghost hidden sm:block w-16 text-right">
                    {service.expectedResponseDays}d
                  </span>

                  {/* Difficulty badge */}
                  <span
                    className={`text-[9px] tracking-[2px] uppercase px-1.5 py-0.5 border shrink-0 ${DIFFICULTY_COLORS[service.deletionDifficulty]}`}
                  >
                    {DIFFICULTY_LABELS[service.deletionDifficulty]}
                  </span>
                </motion.div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
