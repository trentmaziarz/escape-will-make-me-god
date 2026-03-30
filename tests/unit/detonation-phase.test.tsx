// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DetonationPhase from "@/components/detonator/DetonationPhase";
import type { ScannedService } from "@/hooks/useDetonation";

// Mock GSAP
vi.mock("gsap", () => {
  const calls: Array<() => void> = [];
  const timeline = {
    call: vi.fn((fn: () => void) => {
      calls.push(fn);
      return timeline;
    }),
    to: vi.fn(() => timeline),
    kill: vi.fn(),
  };
  return {
    default: {
      timeline: () => timeline,
    },
    __calls: calls,
    __timeline: timeline,
  };
});

vi.mock("@/hooks/useAudio", () => ({
  useAudio: () => ({ playTone: vi.fn() }),
}));

const MOCK_SERVICES: ScannedService[] = [
  {
    serviceId: "facebook",
    confidence: 0.95,
    source: "hibp",
    name: "Facebook",
    icon: "FB",
    category: "social-media",
    deletionDifficulty: "hard",
    deletionMethod: "manual-guide",
  },
  {
    serviceId: "spokeo",
    confidence: 0.8,
    source: "database",
    name: "Spokeo",
    icon: "SP",
    category: "data-broker",
    deletionDifficulty: "auto",
    deletionMethod: "auto-email",
  },
];

const SELECTED = new Set(["facebook", "spokeo"]);

describe("DetonationPhase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header with correct styling text", () => {
    render(
      <DetonationPhase
        services={MOCK_SERVICES}
        selectedServiceIds={SELECTED}
        apiDone={false}
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByText("Detonation in progress")).toBeInTheDocument();
  });

  it("renders only selected services", () => {
    const partial = new Set(["facebook"]);
    render(
      <DetonationPhase
        services={MOCK_SERVICES}
        selectedServiceIds={partial}
        apiDone={false}
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.queryByText("Spokeo")).not.toBeInTheDocument();
  });

  it("shows PENDING status for all services initially", () => {
    render(
      <DetonationPhase
        services={MOCK_SERVICES}
        selectedServiceIds={SELECTED}
        apiDone={false}
        onComplete={vi.fn()}
      />
    );

    const pendingElements = screen.getAllByText("PENDING");
    expect(pendingElements).toHaveLength(2);
  });

  it("renders service icons", () => {
    render(
      <DetonationPhase
        services={MOCK_SERVICES}
        selectedServiceIds={SELECTED}
        apiDone={false}
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByText("FB")).toBeInTheDocument();
    expect(screen.getByText("SP")).toBeInTheDocument();
  });

  it("sets up GSAP timeline for dissolution", async () => {
    const gsapModule = await import("gsap");
    const timeline = (gsapModule as unknown as { __timeline: { to: ReturnType<typeof vi.fn>; call: ReturnType<typeof vi.fn> } }).__timeline;

    render(
      <DetonationPhase
        services={MOCK_SERVICES}
        selectedServiceIds={SELECTED}
        apiDone={false}
        onComplete={vi.fn()}
      />
    );

    // GSAP timeline should have been set up with calls and animations
    expect(timeline.call).toHaveBeenCalled();
    expect(timeline.to).toHaveBeenCalled();
  });

  it("cards are not clickable (cursor default)", () => {
    render(
      <DetonationPhase
        services={MOCK_SERVICES}
        selectedServiceIds={SELECTED}
        apiDone={false}
        onComplete={vi.fn()}
      />
    );

    const cards = screen.getAllByRole("listitem");
    cards.forEach((card) => {
      expect(card.className).toContain("cursor-default");
    });
  });
});
