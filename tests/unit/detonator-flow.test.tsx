// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

let mockToken = "";
const mockReplace = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === "token" ? mockToken || null : null),
  }),
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock hooks with controllable state
let mockPhase = "idle";
let mockError: string | null = null;
let mockTokenInvalid = false;
const mockStartScan = vi.fn();

vi.mock("@/hooks/useDetonation", () => ({
  useDetonation: () => ({
    phase: mockPhase,
    discoveredServices: [],
    selectedServiceIds: new Set(),
    results: mockPhase === "complete" ? { requestsSent: 3, guidesGenerated: 1, reportEmailed: true } : null,
    maskedEmail: "te***@example.com",
    hibpError: false,
    error: mockError,
    tokenInvalid: mockTokenInvalid,
    startScan: mockStartScan,
    toggleService: vi.fn(),
    selectAll: vi.fn(),
    deselectAll: vi.fn(),
    detonate: vi.fn(),
    goToReview: vi.fn(),
    goToComplete: vi.fn(),
  }),
}));

vi.mock("@/hooks/useScan", () => ({
  useScan: () => ({
    visibleServices: [],
    progress: 0,
    isRevealing: false,
    isComplete: false,
    startReveal: vi.fn(),
  }),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, ...rest } = props;
      return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    },
  },
}));

vi.mock("@/hooks/useAudio", () => ({
  useAudio: () => ({ playTone: vi.fn() }),
}));

// Mock GSAP for DetonationPhase
vi.mock("gsap", () => {
  const timeline = {
    call: vi.fn(() => timeline),
    to: vi.fn(() => timeline),
    kill: vi.fn(),
  };
  return { default: { timeline: () => timeline } };
});

import DetonatorFlow from "@/components/detonator/DetonatorFlow";

describe("DetonatorFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToken = "";
    mockPhase = "idle";
    mockError = null;
    mockTokenInvalid = false;
  });

  it("redirects to homepage when no token", () => {
    mockToken = "";
    render(<DetonatorFlow />);

    expect(mockReplace).toHaveBeenCalledWith("/?redirect=no-token");
  });

  it("starts scan when token is present", () => {
    mockToken = "valid-token";
    mockPhase = "scanning";
    render(<DetonatorFlow />);

    expect(mockStartScan).toHaveBeenCalled();
  });

  it("renders scan phase when phase is scanning", () => {
    mockToken = "valid-token";
    mockPhase = "scanning";
    render(<DetonatorFlow />);

    expect(screen.getByText("Scanning your digital footprint")).toBeInTheDocument();
  });

  it("renders review phase when phase is review", () => {
    mockToken = "valid-token";
    mockPhase = "review";
    render(<DetonatorFlow />);

    expect(screen.getByText("Target list")).toBeInTheDocument();
  });

  it("renders detonation phase when phase is detonating", () => {
    mockToken = "valid-token";
    mockPhase = "detonating";
    render(<DetonatorFlow />);

    expect(screen.getByText("Detonation in progress")).toBeInTheDocument();
  });

  it("renders complete phase when phase is complete", () => {
    mockToken = "valid-token";
    mockPhase = "complete";
    render(<DetonatorFlow />);

    expect(screen.getByText("You are disappearing.")).toBeInTheDocument();
  });

  it("shows scan error UI when scan fails with error", () => {
    mockToken = "valid-token";
    mockPhase = "idle";
    mockError = "Internal server error";
    render(<DetonatorFlow />);

    expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to homepage" })).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
