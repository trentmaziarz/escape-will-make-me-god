import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ManifestoText, {
  MANIFESTO_LINES,
} from "@/components/manifesto/ManifestoText";
import InputForm from "@/components/manifesto/InputForm";

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

// Mock useAudio
vi.mock("@/hooks/useAudio", () => ({
  useAudio: () => ({
    playTone: vi.fn(),
  }),
}));

/** Advance through N manifesto lines, wrapping each tick in act(). */
function advanceLines(count: number) {
  for (let i = 0; i < count; i++) {
    const line = MANIFESTO_LINES[i];
    const delay = line === "" ? 400 : 120 + line.length * 30;
    act(() => {
      vi.advanceTimersByTime(delay + 10);
    });
  }
}

describe("ManifestoText", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders no lines initially", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    const nonEmptyLines = MANIFESTO_LINES.filter((l) => l !== "");
    for (const line of nonEmptyLines) {
      expect(screen.queryByText(line)).not.toBeInTheDocument();
    }
  });

  it("renders first line after its delay", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    advanceLines(1);

    expect(screen.getByText(MANIFESTO_LINES[0])).toBeInTheDocument();
  });

  it("renders lines in sequence with staggered timing", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    advanceLines(3);

    expect(screen.getByText(MANIFESTO_LINES[0])).toBeInTheDocument();
    expect(screen.getByText(MANIFESTO_LINES[1])).toBeInTheDocument();
    expect(screen.getByText(MANIFESTO_LINES[2])).toBeInTheDocument();
  });

  it("uses 400ms pause for empty lines", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    // Advance through lines 0-7 (index 7 is empty "")
    advanceLines(8);

    // Line 6 ("They already have everything.") should be visible
    expect(
      screen.getByText(MANIFESTO_LINES[6])
    ).toBeInTheDocument();
  });

  it("calls onComplete when all lines are shown", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    advanceLines(MANIFESTO_LINES.length);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("styles 'Stop counting.' with red color", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    advanceLines(MANIFESTO_LINES.length);

    const stopCounting = screen.getByText("Stop counting.");
    expect(stopCounting).toHaveStyle({ color: "var(--accent-red)" });
  });

  it("styles GDPR line with mono font", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    advanceLines(MANIFESTO_LINES.length);

    const gdprLine = screen.getByText(
      "GDPR Article 17. CCPA Section 1798.105."
    );
    expect(gdprLine).toHaveStyle({ fontFamily: "var(--font-mono)" });
  });

  it("has manifesto region with aria-label", () => {
    const onComplete = vi.fn();
    render(<ManifestoText onComplete={onComplete} />);

    expect(
      screen.getByRole("region", { name: "Manifesto" })
    ).toBeInTheDocument();
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
