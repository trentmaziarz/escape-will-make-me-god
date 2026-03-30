import { NextResponse } from "next/server";
import { getCount } from "@/lib/counter";

export async function GET() {
  const count = await getCount();
  return NextResponse.json({ count });
}
