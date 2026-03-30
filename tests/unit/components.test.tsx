import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";

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
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock useAudio used by ManifestoText
vi.mock("@/hooks/useAudio", () => ({
  useAudio: () => ({ playTone: vi.fn() }),
}));

// --- ScanlineOverlay ---

import ScanlineOverlay from "@/components/layout/ScanlineOverlay";

describe("ScanlineOverlay", () => {
  it("renders a div with scanline-overlay class", () => {
    const { container } = render(<ScanlineOverlay />);
    const el = container.querySelector(".scanline-overlay");
    expect(el).toBeInTheDocument();
  });

  it("is hidden from assistive technology", () => {
    const { container } = render(<ScanlineOverlay />);
    const el = container.querySelector("[aria-hidden]");
    expect(el).toHaveAttribute("aria-hidden", "true");
  });
});

// --- MuteToggle ---

import MuteToggle from "@/components/ui/MuteToggle";

describe("MuteToggle", () => {
  let getItemSpy: ReturnType<typeof vi.spyOn>;
  let setItemSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    setItemSpy = vi.spyOn(Storage.prototype, "setItem");
  });

  afterEach(() => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  it("renders MUTE button by default (unmuted state)", async () => {
    await act(async () => {
      render(<MuteToggle />);
    });
    expect(screen.getByRole("button", { name: /mute sound/i })).toHaveTextContent("MUTE");
  });

  it("renders UNMUTE when localStorage has muted=true", async () => {
    localStorage.setItem("deindex-muted", "true");
    setItemSpy.mockClear();
    await act(async () => {
      render(<MuteToggle />);
    });
    expect(screen.getByRole("button", { name: /unmute sound/i })).toHaveTextContent("UNMUTE");
  });

  it("toggles mute state on click", async () => {
    await act(async () => {
      render(<MuteToggle />);
    });

    const btn = screen.getByRole("button");
    expect(btn).toHaveTextContent("MUTE");

    act(() => {
      fireEvent.click(btn);
    });
    expect(btn).toHaveTextContent("UNMUTE");
    expect(setItemSpy).toHaveBeenCalledWith("deindex-muted", "true");

    act(() => {
      fireEvent.click(btn);
    });
    expect(btn).toHaveTextContent("MUTE");
    expect(setItemSpy).toHaveBeenCalledWith("deindex-muted", "false");
  });
});

// --- ManifestoFlow ---

import ManifestoFlow from "@/components/manifesto/ManifestoFlow";

describe("ManifestoFlow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the title immediately", () => {
    render(<ManifestoFlow />);
    expect(screen.getByText(/DEINDEX/)).toBeInTheDocument();
    expect(screen.getByText(/Offline is the new luxury/)).toBeInTheDocument();
  });

  it("does not show manifesto text before 600ms delay", () => {
    render(<ManifestoFlow />);
    // ManifestoText renders MANIFESTO_LINES which include "They know your name."
    expect(screen.queryByText(/They know your name/)).not.toBeInTheDocument();
  });

  it("shows manifesto region after 600ms delay", () => {
    render(<ManifestoFlow />);
    act(() => {
      vi.advanceTimersByTime(700);
    });
    // ManifestoText container should now be rendered
    expect(screen.getByRole("region", { name: /manifesto/i })).toBeInTheDocument();
  });
});

// --- Counter (async server component) ---

import Counter from "@/components/layout/Counter";

describe("Counter", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("renders count when API returns positive number", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ count: 42_000 }),
    });

    const el = await Counter();
    const { container } = render(el!);
    expect(container.textContent).toContain("42,000");
    expect(container.textContent).toContain("DELETION REQUESTS SENT");
  });

  it("returns null when count is 0", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ count: 0 }),
    });

    const el = await Counter();
    expect(el).toBeNull();
  });

  it("returns null when fetch fails", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const el = await Counter();
    expect(el).toBeNull();
  });

  it("returns null when API returns non-ok response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    const el = await Counter();
    expect(el).toBeNull();
  });
});
