import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { canReplyNow } from "@/lib/social/reply-limits";
import { formatDbReadError } from "@/lib/safe-db";

export async function GET() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const limits = await canReplyNow();

    return NextResponse.json({
      allowed: limits.allowed,
      reason: limits.reason,
      dailyCount: limits.dailyCount,
      dailyLimit: limits.dailyLimit,
      nextAvailableAt: limits.nextAvailableAt?.toISOString() ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: formatDbReadError(error) },
      { status: 503 },
    );
  }
}
