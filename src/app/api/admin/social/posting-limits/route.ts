import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { canPostNow } from "@/lib/social/posting-limits";

export async function GET() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limits = await canPostNow();

  return NextResponse.json({
    allowed: limits.allowed,
    reason: limits.reason,
    dailyCount: limits.dailyCount,
    dailyLimit: limits.dailyLimit,
    nextAvailableAt: limits.nextAvailableAt?.toISOString() ?? null,
  });
}
