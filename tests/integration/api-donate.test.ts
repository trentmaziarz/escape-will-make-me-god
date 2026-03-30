// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// --- Mocks ---

const mockCreate = vi.fn();

vi.mock("stripe", () => {
  const MockStripe = function () {
    return {
      checkout: {
        sessions: {
          create: (...args: unknown[]) => mockCreate(...args),
        },
      },
    };
  };
  return { default: MockStripe };
});

import { POST } from "@/app/api/donate/route";

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/donate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_fake";
  process.env.NEXT_PUBLIC_APP_URL = "https://deindex.me";
  mockCreate.mockReset();
  mockCreate.mockResolvedValue({
    url: "https://checkout.stripe.com/session_abc123",
  });
});

describe("POST /api/donate", () => {
  it("returns Stripe checkout URL for valid amount", async () => {
    const res = await POST(makeRequest({ amount: 1000 }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.url).toBe("https://checkout.stripe.com/session_abc123");
    expect(mockCreate).toHaveBeenCalledOnce();

    const createArgs = mockCreate.mock.calls[0][0];
    expect(createArgs.mode).toBe("payment");
    expect(createArgs.line_items[0].price_data.unit_amount).toBe(1000);
    expect(createArgs.line_items[0].price_data.currency).toBe("usd");
    expect(createArgs.success_url).toContain("/donate?success=true");
    expect(createArgs.cancel_url).toContain("/donate?cancelled=true");
  });

  it("returns 400 for non-integer amount", async () => {
    const res = await POST(makeRequest({ amount: 10.5 }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("integer");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for string amount", async () => {
    const res = await POST(makeRequest({ amount: "ten dollars" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("integer");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for amount below minimum ($1)", async () => {
    const res = await POST(makeRequest({ amount: 50 }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("between");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for amount above maximum ($1000)", async () => {
    const res = await POST(makeRequest({ amount: 200_000 }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("between");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for missing amount", async () => {
    const res = await POST(makeRequest({}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("accepts minimum amount ($1 = 100 cents)", async () => {
    const res = await POST(makeRequest({ amount: 100 }));
    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("accepts maximum amount ($1000 = 100000 cents)", async () => {
    const res = await POST(makeRequest({ amount: 100_000 }));
    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("returns 500 when Stripe fails", async () => {
    mockCreate.mockRejectedValue(new Error("Stripe API error"));

    const res = await POST(makeRequest({ amount: 1000 }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Failed to create donation session");
  });

  it("returns 500 when Stripe returns no URL", async () => {
    mockCreate.mockResolvedValue({ url: null });

    const res = await POST(makeRequest({ amount: 1000 }));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Failed to create checkout session");
  });
});
