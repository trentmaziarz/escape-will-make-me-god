// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { _resetCount, incrementCount } from "@/lib/counter";
import { GET } from "@/app/api/counter/route";

beforeEach(() => {
  _resetCount();
});

describe("GET /api/counter", () => {
  it("returns { count: 0 } when no deletions have occurred", async () => {
    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ count: 0 });
  });

  it("returns the current count after increments", async () => {
    await incrementCount(5);
    await incrementCount(3);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({ count: 8 });
  });

  it("resets properly between tests", async () => {
    const res = await GET();
    const data = await res.json();

    expect(data.count).toBe(0);
  });
});

describe("counter lib (in-memory fallback)", () => {
  it("incrementCount returns the new total", async () => {
    const result = await incrementCount(10);
    expect(result).toBe(10);
  });

  it("incrementCount accumulates across calls", async () => {
    await incrementCount(2);
    await incrementCount(3);
    const result = await incrementCount(5);
    expect(result).toBe(10);
  });
});
