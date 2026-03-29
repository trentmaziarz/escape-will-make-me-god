import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAudio, _resetAudioContext } from "@/hooks/useAudio";

describe("useAudio", () => {
  let mockOscillator: {
    type: string;
    frequency: { value: number };
    connect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };
  let mockGainNode: {
    gain: { value: number; exponentialRampToValueAtTime: ReturnType<typeof vi.fn> };
    connect: ReturnType<typeof vi.fn>;
  };
  let resumeFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOscillator = {
      type: "sine",
      frequency: { value: 0 },
      connect: vi.fn().mockReturnThis(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    mockGainNode = {
      gain: {
        value: 0,
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
    resumeFn = vi.fn();

    // Use a proper constructor function for `new AudioContext()`
    globalThis.AudioContext = function MockAudioContext(this: AudioContext) {
      Object.assign(this, {
        currentTime: 1,
        state: "running",
        resume: resumeFn,
        close: vi.fn().mockResolvedValue(undefined),
        createOscillator: vi.fn(() => mockOscillator),
        createGain: vi.fn(() => mockGainNode),
        destination: {},
      });
    } as unknown as typeof AudioContext;

    localStorage.clear();
    _resetAudioContext();
  });

  afterEach(() => {
    _resetAudioContext();
    vi.restoreAllMocks();
  });

  it("creates oscillator and sets parameters via playTone", () => {
    const { result } = renderHook(() => useAudio());
    result.current.playTone(440, 0.5, "triangle", 0.08);

    expect(mockOscillator.type).toBe("triangle");
    expect(mockOscillator.frequency.value).toBe(440);
    expect(mockGainNode.gain.value).toBe(0.08);
    expect(mockOscillator.connect).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();
    expect(mockOscillator.stop).toHaveBeenCalled();
  });

  it("does not play when muted", () => {
    localStorage.setItem("deindex-muted", "true");

    const { result } = renderHook(() => useAudio());
    result.current.playTone(440, 0.5);

    expect(mockOscillator.start).not.toHaveBeenCalled();
  });

  it("plays when unmuted (no muted key in storage)", () => {
    const { result } = renderHook(() => useAudio());
    result.current.playTone(440, 0.5);

    expect(mockOscillator.start).toHaveBeenCalled();
  });

  it("does not throw when AudioContext is unavailable", () => {
    globalThis.AudioContext = function () {
      throw new Error("Not supported");
    } as unknown as typeof AudioContext;

    const { result } = renderHook(() => useAudio());
    expect(() => result.current.playTone(440, 0.5)).not.toThrow();
  });

  it("uses default parameters (sine, 0.05 volume)", () => {
    const { result } = renderHook(() => useAudio());
    result.current.playTone(300, 0.2);

    expect(mockOscillator.type).toBe("sine");
    expect(mockGainNode.gain.value).toBe(0.05);
  });
});
