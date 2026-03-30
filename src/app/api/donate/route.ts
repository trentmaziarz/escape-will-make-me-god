import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const MIN_AMOUNT = 100; // $1.00 minimum
const MAX_AMOUNT = 100_000; // $1,000.00 maximum

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount } = body;

    if (typeof amount !== "number" || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: "Amount must be an integer (cents)" },
        { status: 400 }
      );
    }

    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: `Amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT} cents` },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://deindex.me";

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: {
              name: "Support DEINDEX.ME",
              description: "One-time donation to keep the cause alive",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/donate?success=true`,
      cancel_url: `${appUrl}/donate?cancelled=true`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create donation session" },
      { status: 500 }
    );
  }
}
