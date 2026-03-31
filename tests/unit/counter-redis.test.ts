// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockGet = vi.fn();
const mockIncrby = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: class MockRedis {
    get = mockGet;
    incrby = mockIncrby;
  },
}));

import { getCount, incrementCount } from "@/lib/counter";

describe("counter (Redis path)", () => {
  beforeEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake-redis.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    mockGet.mockReset();
    mockIncrby.mockReset();
  });

  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("getCount returns value from Redis", async () => {
    mockGet.mockResolvedValue(42);
    const count = await getCount();
    expect(count).toBe(42);
    expect(mockGet).toHaveBeenCalledWith("deletion_counter");
  });

  it("getCount returns 0 when Redis returns null", async () => {
    mockGet.mockResolvedValue(null);
    const count = await getCount();
    expect(count).toBe(0);
  });

  it("incrementCount delegates to Redis incrby", async () => {
    mockIncrby.mockResolvedValue(15);
    const count = await incrementCount(5);
    expect(count).toBe(15);
    expect(mockIncrby).toHaveBeenCalledWith("deletion_counter", 5);
  });
});
