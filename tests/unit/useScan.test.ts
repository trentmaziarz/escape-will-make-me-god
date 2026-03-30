// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScan } from "@/hooks/useScan";
import type { ScannedService } from "@/hooks/useDetonation";

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
  {
    serviceId: "linkedin",
    confidence: 0.7,
    source: "hibp",
    name: "LinkedIn",
    icon: "LI",
    category: "social-media",
    deletionDifficulty: "medium",
    deletionMethod: "user-email",
  },
];

describe("useScan", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with empty state", () => {
    const { result } = renderHook(() => useScan([]));

    expect(result.current.visibleServices).toEqual([]);
    expect(result.current.progress).toBe(0);
    expect(result.current.isRevealing).toBe(false);
    expect(result.current.isComplete).toBe(false);
  });

  it("does nothing when startReveal called with empty services", () => {
    const { result } = renderHook(() => useScan([]));

    act(() => {
      result.current.startReveal();
    });

    expect(result.current.isRevealing).toBe(false);
  });

  it("reveals services one at a time at 400ms intervals", () => {
    const { result } = renderHook(() => useScan(MOCK_SERVICES));

    act(() => {
      result.current.startReveal();
    });

    expect(result.current.isRevealing).toBe(true);
    expect(result.current.visibleServices).toHaveLength(0);

    // First service after 400ms
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.visibleServices).toHaveLength(1);
    expect(result.current.visibleServices[0].name).toBe("Facebook");

    // Second service after another 400ms
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.visibleServices).toHaveLength(2);

    // Third service
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.visibleServices).toHaveLength(3);
  });

  it("completes after all services revealed", () => {
    const { result } = renderHook(() => useScan(MOCK_SERVICES));

    act(() => {
      result.current.startReveal();
    });

    // Reveal all 3 services
    act(() => {
      vi.advanceTimersByTime(400 * 3);
    });

    expect(result.current.visibleServices).toHaveLength(3);
    expect(result.current.progress).toBe(100);

    // One more tick to clear the interval
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current.isRevealing).toBe(false);
    expect(result.current.isComplete).toBe(true);
  });

  it("calculates progress correctly", () => {
    const { result } = renderHook(() => useScan(MOCK_SERVICES));

    act(() => {
      result.current.startReveal();
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.progress).toBe(33); // 1/3

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.progress).toBe(67); // 2/3
  });

  it("does not restart reveal if already revealing", () => {
    const { result } = renderHook(() => useScan(MOCK_SERVICES));

    act(() => {
      result.current.startReveal();
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.visibleServices).toHaveLength(1);

    // Try to start again — should be a no-op
    act(() => {
      result.current.startReveal();
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });
    // Should be 2, not 1 (didn't restart from 0)
    expect(result.current.visibleServices).toHaveLength(2);
  });

  it("cleans up interval on unmount", () => {
    const { result, unmount } = renderHook(() => useScan(MOCK_SERVICES));

    act(() => {
      result.current.startReveal();
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.visibleServices).toHaveLength(1);

    unmount();

    // Should not throw after unmount
    act(() => {
      vi.advanceTimersByTime(400 * 10);
    });
  });
});
