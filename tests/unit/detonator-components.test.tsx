// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ScanPhase from "@/components/detonator/ScanPhase";
import ReviewPhase from "@/components/detonator/ReviewPhase";
import CompletePhase from "@/components/detonator/CompletePhase";
import type { ScannedService } from "@/hooks/useDetonation";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { initial, animate, transition, whileHover, ...rest } = props;
      return <div {...(rest as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    },
  },
}));

// Mock useAudio
vi.mock("@/hooks/useAudio", () => ({
  useAudio: () => ({ playTone: vi.fn() }),
}));

const MOCK_SERVICES: ScannedService[] = [
  {
    serviceId: "facebook",
    confidence: 0.95,
    source: "hibp",
    name: "Facebook",
    icon: "📘",
    category: "social-media",
    deletionDifficulty: "hard",
    deletionMethod: "manual-guide",
  },
  {
    serviceId: "spokeo",
    confidence: 0.8,
    source: "database",
    name: "Spokeo",
    icon: "🔍",
    category: "data-broker",
    deletionDifficulty: "auto",
    deletionMethod: "auto-email",
  },
  {
    serviceId: "linkedin",
    confidence: 0.7,
    source: "hibp",
    name: "LinkedIn",
    icon: "💼",
    category: "social-media",
    deletionDifficulty: "medium",
    deletionMethod: "user-email",
  },
];

describe("ScanPhase", () => {
  it("renders progress bar and visible services", () => {
    render(
      <ScanPhase
        visibleServices={MOCK_SERVICES.slice(0, 2)}
        progress={67}
        isRevealing={true}
        maskedEmail="te***@example.com"
      />
    );

    expect(screen.getByText("Scanning your digital footprint")).toBeInTheDocument();
    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("Spokeo")).toBeInTheDocument();
    expect(screen.getByText(/67% complete/)).toBeInTheDocument();
  });

  it("shows correct index numbers", () => {
    render(
      <ScanPhase
        visibleServices={MOCK_SERVICES.slice(0, 2)}
        progress={67}
        isRevealing={true}
        maskedEmail="te***@example.com"
      />
    );

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
  });

  it("displays difficulty labels correctly", () => {
    render(
      <ScanPhase
        visibleServices={MOCK_SERVICES}
        progress={100}
        isRevealing={false}
        maskedEmail="te***@example.com"
      />
    );

    expect(screen.getByText("HARD")).toBeInTheDocument();
    expect(screen.getByText("AUTO-DELETE")).toBeInTheDocument();
    expect(screen.getByText("MEDIUM")).toBeInTheDocument();
  });

  it("displays masked email in progress text", () => {
    render(
      <ScanPhase
        visibleServices={MOCK_SERVICES}
        progress={100}
        isRevealing={false}
        maskedEmail="te***@example.com"
      />
    );

    expect(screen.getByText(/te\*\*\*@example\.com/)).toBeInTheDocument();
  });
});

describe("ReviewPhase", () => {
  const defaultProps = {
    services: MOCK_SERVICES,
    selectedServiceIds: new Set(["facebook", "linkedin"]),
    hibpError: false,
    onToggle: vi.fn(),
    onSelectAll: vi.fn(),
    onDeselectAll: vi.fn(),
    onDetonate: vi.fn(),
  };

  it("renders target list with all services", () => {
    render(<ReviewPhase {...defaultProps} />);

    expect(screen.getByText("Target list")).toBeInTheDocument();
    expect(screen.getByText("Facebook")).toBeInTheDocument();
    expect(screen.getByText("Spokeo")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
  });

  it("splits services into confirmed and suggestions sections", () => {
    render(<ReviewPhase {...defaultProps} />);

    // Confirmed section header
    expect(screen.getByText("Found accounts")).toBeInTheDocument();
    // Suggestions section header
    expect(screen.getByText("You may also have accounts on")).toBeInTheDocument();

    // Confirmed section contains HIBP services
    const confirmedList = screen.getByRole("list", { name: "Confirmed accounts" });
    expect(confirmedList).toBeInTheDocument();

    // Suggestions section contains database services
    const suggestedList = screen.getByRole("list", { name: "Suggested services" });
    expect(suggestedList).toBeInTheDocument();
  });

  it("shows 'no confirmed' note when HIBP found nothing (no error)", () => {
    const dbOnlyServices: ScannedService[] = [
      {
        serviceId: "spokeo",
        confidence: 0.2,
        source: "database",
        name: "Spokeo",
        icon: "🔍",
        category: "data-broker",
        deletionDifficulty: "auto",
        deletionMethod: "auto-email",
      },
    ];
    render(
      <ReviewPhase
        {...defaultProps}
        services={dbOnlyServices}
        selectedServiceIds={new Set()}
        hibpError={false}
      />
    );

    expect(
      screen.getByText(/didn\u2019t find confirmed accounts/)
    ).toBeInTheDocument();
    expect(screen.queryByText("Found accounts")).not.toBeInTheDocument();
  });

  it("shows HIBP error note when breach database failed", () => {
    const dbOnlyServices: ScannedService[] = [
      {
        serviceId: "spokeo",
        confidence: 0.2,
        source: "database",
        name: "Spokeo",
        icon: "🔍",
        category: "data-broker",
        deletionDifficulty: "auto",
        deletionMethod: "auto-email",
      },
    ];
    render(
      <ReviewPhase
        {...defaultProps}
        services={dbOnlyServices}
        selectedServiceIds={new Set()}
        hibpError={true}
      />
    );

    expect(
      screen.getByText(/Breach database unavailable/)
    ).toBeInTheDocument();
    expect(screen.queryByText("Found accounts")).not.toBeInTheDocument();
  });

  it("shows selected count", () => {
    render(<ReviewPhase {...defaultProps} />);

    expect(
      screen.getByText("2 services selected for deletion. Tap to deselect.")
    ).toBeInTheDocument();
  });

  it("shows singular when one selected", () => {
    render(
      <ReviewPhase
        {...defaultProps}
        selectedServiceIds={new Set(["facebook"])}
      />
    );

    expect(
      screen.getByText("1 service selected for deletion. Tap to deselect.")
    ).toBeInTheDocument();
  });

  it("calls onToggle when service clicked", () => {
    const onToggle = vi.fn();
    render(<ReviewPhase {...defaultProps} onToggle={onToggle} />);

    fireEvent.click(screen.getByText("Facebook"));
    expect(onToggle).toHaveBeenCalledWith("facebook");
  });

  it("calls onDetonate when button clicked", () => {
    const onDetonate = vi.fn();
    render(<ReviewPhase {...defaultProps} onDetonate={onDetonate} />);

    fireEvent.click(screen.getByText("Detonate"));
    expect(onDetonate).toHaveBeenCalledOnce();
  });

  it("disables detonate button when nothing selected", () => {
    render(
      <ReviewPhase {...defaultProps} selectedServiceIds={new Set()} />
    );

    const btn = screen.getByText("Detonate");
    expect(btn).toBeDisabled();
  });

  it("shows irreversibility warning", () => {
    render(<ReviewPhase {...defaultProps} />);

    expect(
      screen.getByText("THIS ACTION IS IRREVERSIBLE")
    ).toBeInTheDocument();
  });

  it("calls selectAll and deselectAll", () => {
    const onSelectAll = vi.fn();
    const onDeselectAll = vi.fn();
    render(
      <ReviewPhase
        {...defaultProps}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
      />
    );

    fireEvent.click(screen.getByText("ALL"));
    expect(onSelectAll).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByText("NONE"));
    expect(onDeselectAll).toHaveBeenCalledOnce();
  });
});

describe("CompletePhase", () => {
  it("renders completion message", () => {
    render(
      <CompletePhase
        results={{ requestsSent: 5, guidesGenerated: 3, reportEmailed: true }}
        maskedEmail="te***@example.com"
      />
    );

    expect(screen.getByText("You are disappearing.")).toBeInTheDocument();
    expect(screen.getByText(/8 deletion requests sent/i)).toBeInTheDocument();
    expect(screen.getByText(/te\*\*\*@example\.com/)).toBeInTheDocument();
    expect(
      screen.getByText(/We have already forgotten you/)
    ).toBeInTheDocument();
  });

  it("shows singular for 1 request", () => {
    render(
      <CompletePhase
        results={{ requestsSent: 1, guidesGenerated: 0, reportEmailed: true }}
        maskedEmail="te***@example.com"
      />
    );

    expect(screen.getByText(/1 deletion request sent/i)).toBeInTheDocument();
  });

  it("shows donation link", () => {
    render(
      <CompletePhase
        results={{ requestsSent: 2, guidesGenerated: 0, reportEmailed: true }}
        maskedEmail="te***@example.com"
      />
    );

    const link = screen.getByText(/support the cause/i);
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/donate");
  });

  it("falls back to 'your email' when maskedEmail is empty", () => {
    render(
      <CompletePhase
        results={{ requestsSent: 1, guidesGenerated: 0, reportEmailed: true }}
        maskedEmail=""
      />
    );

    expect(screen.getByText(/your email/)).toBeInTheDocument();
  });
});
