import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import ManifestoText, {
  MANIFESTO_SEQUENCE,
} from "@/components/manifesto/ManifestoText";
import InputForm from "@/components/manifesto/InputForm";
import en from "@/i18n/messages/en.json";

// Mock framer-motion to render immediately without animation
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      style,
      className,
      ...rest
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div style={style} className={className} {...rest}>
        {children}
      </div>
    ),
    form: ({
      children,
      onSubmit,
      className,
      ...rest
    }: React.FormHTMLAttributes<HTMLFormElement>) => (
      <form onSubmit={onSubmit} className={className} {...rest}>
        {children}
      </form>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Track playTone calls
const mockPlayTone = vi.fn();

// Mock useAudio
vi.mock("@/hooks/useAudio", () => ({
  useAudio: () => ({
    playTone: mockPlayTone,
  }),
}));

// Mock Turnstile — immediately delivers a test token via onSuccess
vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({ onSuccess }: { onSuccess?: (token: string) => void }) => {
    useEffect(() => {
      onSuccess?.("test-turnstile-token");
    }, [onSuccess]);
    return <div data-testid="turnstile" />;
  },
}));

// Mock next/dynamic to render component synchronously in tests
vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<{ default: React.ComponentType }>) => {
    let Comp: React.ComponentType | null = null;
    loader().then((mod) => {
      Comp = mod.default;
    });
    return function DynamicMock(props: Record<string, unknown>) {
      return Comp ? <Comp {...props} /> : null;
    };
  },
}));

// Ensure the Turnstile site key is set so the widget renders
process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";

// Build a text array mirroring the old MANIFESTO_LINES from MANIFESTO_SEQUENCE + en.json
const manifestoMessages = en.landing.manifesto;
const LINES: string[] = MANIFESTO_SEQUENCE.map((entry) =>
  "spacer" in entry
    ? ""
    : manifestoMessages[entry.key as keyof typeof manifestoMessages] ?? ""
);

const NON_EMPTY_LINES = LINES.filter((l) => l !== "");

/** Advance through N manifesto entries, wrapping each tick in act(). */
function advanceLines(count: number) {
  for (let i = 0; i < count; i++) {
    const line = LINES[i];
    const delay = line === "" ? 400 : 120 + line.length * 30;
    act(() => {
      vi.advanceTimersByTime(delay + 10);
    });
  }
}

describe("ManifestoText", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPlayTone.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders no lines initially", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    for (const line of NON_EMPTY_LINES) {
      expect(screen.queryByText(line)).not.toBeInTheDocument();
    }
  });

  it("renders first line after its delay", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    advanceLines(1);

    expect(screen.getByText(LINES[0])).toBeInTheDocument();
  });

  it("renders lines in sequence with staggered timing", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    advanceLines(3);

    expect(screen.getByText(LINES[0])).toBeInTheDocument();
    expect(screen.getByText(LINES[1])).toBeInTheDocument();
    expect(screen.getByText(LINES[2])).toBeInTheDocument();
  });

  it("uses 400ms pause for empty lines", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    // Advance through lines 0-7 (index 7 is spacer)
    advanceLines(8);

    // Line 6 ("They already have everything.") should be visible
    expect(screen.getByText(LINES[6])).toBeInTheDocument();
  });

  it("calls onComplete when all lines are shown", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    advanceLines(LINES.length);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("styles final line with red color", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    advanceLines(LINES.length);

    const lastTextLine = NON_EMPTY_LINES.at(-1)!;
    const stopCounting = screen.getByText(lastTextLine);
    expect(stopCounting).toHaveStyle({ color: "var(--accent-red)" });
  });

  it("styles GDPR line with mono font", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    advanceLines(LINES.length);

    const gdprLine = screen.getByText(
      en.landing.manifesto.line10
    );
    expect(gdprLine).toHaveStyle({ fontFamily: "var(--font-mono)" });
  });

  it("has manifesto region with aria-label", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    expect(
      screen.getByRole("region", { name: en.landing.manifesto.ariaLabel })
    ).toBeInTheDocument();
  });

  describe("skip", () => {
    it("reveals all lines immediately when skip becomes true", () => {
      const onComplete = vi.fn();
      const { rerender } = render(
        <ManifestoText onComplete={onComplete} skip={false} />
      );

      // Advance a few lines but not all
      advanceLines(3);
      expect(screen.getByText(LINES[0])).toBeInTheDocument();
      expect(screen.queryByText(NON_EMPTY_LINES.at(-1)!)).not.toBeInTheDocument();

      // Trigger skip
      rerender(<ManifestoText onComplete={onComplete} skip={true} />);

      // All lines should now be visible
      for (const line of NON_EMPTY_LINES) {
        expect(screen.getByText(line)).toBeInTheDocument();
      }
      expect(onComplete).toHaveBeenCalled();
    });

    it("does not play audio tones after skip", () => {
      const onComplete = vi.fn();
      const { rerender } = render(
        <ManifestoText onComplete={onComplete} skip={false} />
      );

      // Advance 1 line (plays audio)
      advanceLines(1);
      const callsBeforeSkip = mockPlayTone.mock.calls.length;

      // Skip
      rerender(<ManifestoText onComplete={onComplete} skip={true} />);
      mockPlayTone.mockClear();

      // Advance timers — no more audio should play
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(mockPlayTone).not.toHaveBeenCalled();
    });

    it("stops timer-based animation after skip", () => {
      const onComplete = vi.fn();
      const { rerender } = render(
        <ManifestoText onComplete={onComplete} skip={false} />
      );

      advanceLines(2);
      const visibleBefore = NON_EMPTY_LINES.filter(
        (line) => screen.queryByText(line) !== null
      ).length;

      rerender(<ManifestoText onComplete={onComplete} skip={true} />);

      // All lines visible after skip
      const visibleAfter = NON_EMPTY_LINES.filter(
        (line) => screen.queryByText(line) !== null
      ).length;
      expect(visibleAfter).toBe(NON_EMPTY_LINES.length);
      expect(visibleAfter).toBeGreaterThan(visibleBefore);
    });
  });

  describe("autoSkip", () => {
    it("shows all lines immediately with no animation", () => {
      const onComplete = vi.fn();
      render(<ManifestoText onComplete={onComplete} autoSkip={true} />);

      // All lines visible on first render — no timers needed
      for (const line of NON_EMPTY_LINES) {
        expect(screen.getByText(line)).toBeInTheDocument();
      }
    });

    it("calls onComplete on mount", () => {
      const onComplete = vi.fn();
      render(<ManifestoText onComplete={onComplete} autoSkip={true} />);

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("does not play any audio tones", () => {
      const onComplete = vi.fn();
      render(<ManifestoText onComplete={onComplete} autoSkip={true} />);

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(mockPlayTone).not.toHaveBeenCalled();
    });
  });
});

describe("ManifestoFlow", () => {
  let ManifestoFlow: typeof import("@/components/manifesto/ManifestoFlow").default;

  beforeEach(async () => {
    vi.useFakeTimers();
    mockPlayTone.mockClear();
    localStorage.clear();
    // Dynamic import to get fresh module per test
    const mod = await import("@/components/manifesto/ManifestoFlow");
    ManifestoFlow = mod.default;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows skip indicator during animation for new visitors", () => {
    render(<ManifestoFlow />);

    // Past the 600ms initial delay
    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(screen.getByText(/(?:click|tap) to skip/i)).toBeInTheDocument();
  });

  it("skips animation on click", () => {
    render(<ManifestoFlow />);

    // Start animation
    act(() => {
      vi.advanceTimersByTime(700);
    });

    // Advance a couple lines
    advanceLines(2);

    // Not all lines visible yet
    expect(screen.queryByText(NON_EMPTY_LINES.at(-1)!)).not.toBeInTheDocument();

    // Click to skip
    act(() => {
      fireEvent.click(document);
    });

    // All lines should now be visible
    for (const line of NON_EMPTY_LINES) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }

    // Skip indicator should be gone
    expect(screen.queryByText(/(?:click|tap) to skip/i)).not.toBeInTheDocument();
  });

  it("skips animation on Space key", () => {
    render(<ManifestoFlow />);

    act(() => {
      vi.advanceTimersByTime(700);
    });
    advanceLines(1);

    act(() => {
      fireEvent.keyDown(document, { key: " " });
    });

    for (const line of NON_EMPTY_LINES) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
  });

  it("skips animation on Enter key", () => {
    render(<ManifestoFlow />);

    act(() => {
      vi.advanceTimersByTime(700);
    });
    advanceLines(1);

    act(() => {
      fireEvent.keyDown(document, { key: "Enter" });
    });

    for (const line of NON_EMPTY_LINES) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
  });

  it("skips animation on Escape key", () => {
    render(<ManifestoFlow />);

    act(() => {
      vi.advanceTimersByTime(700);
    });
    advanceLines(1);

    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });

    for (const line of NON_EMPTY_LINES) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
  });

  it("auto-skips for returning visitors", () => {
    localStorage.setItem("deindex-visited", "true");
    render(<ManifestoFlow />);

    // No delay needed — all lines should be visible immediately after effect
    act(() => {
      vi.advanceTimersByTime(0);
    });

    for (const line of NON_EMPTY_LINES) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }

    // No skip indicator shown
    expect(screen.queryByText(/(?:click|tap) to skip/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/tap to skip/i)).not.toBeInTheDocument();
  });

  it("sets deindex-visited flag on first visit", () => {
    render(<ManifestoFlow />);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(localStorage.getItem("deindex-visited")).toBe("true");
  });

  it("does not play audio when auto-skipped", () => {
    localStorage.setItem("deindex-visited", "true");
    render(<ManifestoFlow />);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(mockPlayTone).not.toHaveBeenCalled();
  });
});

describe("InputForm", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders email and phone inputs", () => {
    render(<InputForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  it("submit button is disabled with empty email", () => {
    render(<InputForm />);

    const button = screen.getByRole("button", {
      name: /begin your disappearance/i,
    });
    expect(button).toBeDisabled();
  });

  it("submit button is enabled with valid email", async () => {
    const user = userEvent.setup();
    render(<InputForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");

    const button = screen.getByRole("button", {
      name: /begin your disappearance/i,
    });
    expect(button).toBeEnabled();
  });

  it("submit button stays disabled with invalid email", async () => {
    const user = userEvent.setup();
    render(<InputForm />);

    await user.type(screen.getByLabelText(/email/i), "not-an-email");

    const button = screen.getByRole("button", {
      name: /begin your disappearance/i,
    });
    expect(button).toBeDisabled();
  });

  it("shows confirmation after successful submit", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const user = userEvent.setup();
    render(<InputForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.click(
      screen.getByRole("button", { name: /begin your disappearance/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it("shows error message on failed submit", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: "Rate limit exceeded" }),
    });

    const user = userEvent.setup();
    render(<InputForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.click(
      screen.getByRole("button", { name: /begin your disappearance/i })
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Rate limit exceeded"
      );
    });
  });

  it("sends email and phone in POST body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    globalThis.fetch = mockFetch;

    const user = userEvent.setup();
    render(<InputForm />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/phone/i), "+15550001234");
    await user.click(
      screen.getByRole("button", { name: /begin your disappearance/i })
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          phone: "+15550001234",
          turnstileToken: "test-turnstile-token",
        }),
      });
    });
  });

  it("has links to privacy policy and terms", () => {
    render(<InputForm />);

    expect(screen.getByText("privacy policy")).toHaveAttribute(
      "href",
      "/about/privacy"
    );
    expect(screen.getByText("terms")).toHaveAttribute("href", "/about/terms");
  });
});
