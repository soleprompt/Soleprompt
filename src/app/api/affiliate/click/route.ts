import { NextResponse } from "next/server";
import { recordReferralClick } from "@/lib/affiliate-program";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      code?: string;
      landingPath?: string;
    };

    if (!body.code?.trim()) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    await recordReferralClick(body.code.trim(), body.landingPath);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to track click" }, { status: 500 });
  }
}
