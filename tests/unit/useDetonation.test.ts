// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDetonation } from "@/hooks/useDetonation";
import type { ScannedService } from "@/hooks/useDetonation";

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
];

const MOCK_SCAN_RESPONSE = {
  services: MOCK_SERVICES,
  scannedAt: "2026-03-29T12:00:00.000Z",
  maskedEmail: "te***@example.com",
};

const MOCK_DETONATE_RESPONSE = {
  success: true,
  requestsSent: 1,
  guidesGenerated: 1,
  reportEmailed: true,
};

let mockFetch: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockFetch = vi.fn();
  global.fetch = mockFetch as unknown as typeof fetch;
});

describe("useDetonation", () => {
  it("starts in idle phase with empty state", () => {
    const { result } = renderHook(() => useDetonation("test-token"));

    expect(result.current.phase).toBe("idle");
    expect(result.current.discoveredServices).toEqual([]);
    expect(result.current.selectedServiceIds.size).toBe(0);
    expect(result.current.results).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("transitions to scanning on startScan", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_SCAN_RESPONSE,
    });

    const { result } = renderHook(() => useDetonation("test-token"));

    await act(async () => {
      await result.current.startScan();
    });

    expect(result.current.phase).toBe("scanning");
    expect(result.current.discoveredServices).toHaveLength(2);
    // Only HIBP-confirmed services are auto-selected
    expect(result.current.selectedServiceIds.size).toBe(1);
    expect(result.current.selectedServiceIds.has("facebook")).toBe(true);
    expect(result.current.selectedServiceIds.has("spokeo")).toBe(false);
    expect(result.current.maskedEmail).toBe("te***@example.com");
  });

  it("sends correct scan request", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_SCAN_RESPONSE,
    });

    const { result } = renderHook(() => useDetonation("my-token"));

    await act(async () => {
      await result.current.startScan();
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "my-token" }),
    });
  });

  it("handles scan API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid or expired token" }),
    });

    const { result } = renderHook(() => useDetonation("bad-token"));

    await act(async () => {
      await result.current.startScan();
    });

    expect(result.current.phase).toBe("idle");
    expect(result.current.error).toBe("Invalid or expired token");
  });

  it("does not scan without token", async () => {
    const { result } = renderHook(() => useDetonation(""));

    await act(async () => {
      await result.current.startScan();
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.phase).toBe("idle");
  });

  it("toggleService adds and removes service IDs", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_SCAN_RESPONSE,
    });

    const { result } = renderHook(() => useDetonation("test-token"));

    await act(async () => {
      await result.current.startScan();
    });

    // Only HIBP service (facebook) is auto-selected
    expect(result.current.selectedServiceIds.has("facebook")).toBe(true);
    expect(result.current.selectedServiceIds.has("spokeo")).toBe(false);

    // Deselect facebook
    act(() => {
      result.current.toggleService("facebook");
    });
    expect(result.current.selectedServiceIds.has("facebook")).toBe(false);
    expect(result.current.selectedServiceIds.has("spokeo")).toBe(false);

    // Re-select facebook
    act(() => {
      result.current.toggleService("facebook");
    });
    expect(result.current.selectedServiceIds.has("facebook")).toBe(true);
  });

  it("selectAll and deselectAll work", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_SCAN_RESPONSE,
    });

    const { result } = renderHook(() => useDetonation("test-token"));

    await act(async () => {
      await result.current.startScan();
    });

    act(() => {
      result.current.deselectAll();
    });
    expect(result.current.selectedServiceIds.size).toBe(0);

    act(() => {
      result.current.selectAll();
    });
    expect(result.current.selectedServiceIds.size).toBe(2);
  });

  it("detonate sends correct request and stores results", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_SCAN_RESPONSE,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_DETONATE_RESPONSE,
      });

    const { result } = renderHook(() => useDetonation("test-token"));

    await act(async () => {
      await result.current.startScan();
    });

    await act(async () => {
      await result.current.detonate();
    });

    expect(result.current.phase).toBe("detonating");
    expect(result.current.results).toEqual({
      requestsSent: 1,
      guidesGenerated: 1,
      reportEmailed: true,
    });

    // Check the detonate fetch call
    const detonateCall = mockFetch.mock.calls[1];
    expect(detonateCall[0]).toBe("/api/detonate");
    const body = JSON.parse(detonateCall[1].body);
    expect(body.token).toBe("test-token");
    expect(body.selectedServiceIds).toEqual(["facebook"]);
  });

  it("does not detonate with empty selection", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_SCAN_RESPONSE,
    });

    const { result } = renderHook(() => useDetonation("test-token"));

    await act(async () => {
      await result.current.startScan();
    });

    act(() => {
      result.current.deselectAll();
    });

    await act(async () => {
      await result.current.detonate();
    });

    // Should still be scanning phase, not detonating
    expect(result.current.phase).not.toBe("detonating");
    // Only the scan fetch call should have been made
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("handles detonate API error gracefully", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_SCAN_RESPONSE,
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Too many requests" }),
      });

    const { result } = renderHook(() => useDetonation("test-token"));

    await act(async () => {
      await result.current.startScan();
    });

    await act(async () => {
      await result.current.detonate();
    });

    expect(result.current.error).toBe("Too many requests");
    // Results still set so the animation can complete
    expect(result.current.results).toBeDefined();
  });

  it("exposes hibpError flag from scan response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...MOCK_SCAN_RESPONSE,
        hibpError: true,
        partial: true,
      }),
    });

    const { result } = renderHook(() => useDetonation("test-token"));

    await act(async () => {
      await result.current.startScan();
    });

    expect(result.current.hibpError).toBe(true);
    expect(result.current.scanPartial).toBe(true);
  });

  it("hibpError defaults to false when not in response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_SCAN_RESPONSE,
    });

    const { result } = renderHook(() => useDetonation("test-token"));

    await act(async () => {
      await result.current.startScan();
    });

    expect(result.current.hibpError).toBe(false);
  });

  it("goToReview and goToComplete transition phases", () => {
    const { result } = renderHook(() => useDetonation("test-token"));

    act(() => {
      result.current.goToReview();
    });
    expect(result.current.phase).toBe("review");

    act(() => {
      result.current.goToComplete();
    });
    expect(result.current.phase).toBe("complete");
  });
});
