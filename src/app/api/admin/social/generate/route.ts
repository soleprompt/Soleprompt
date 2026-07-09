import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { isSocialAutoApproveEnabled } from "@/lib/social/auto-social-config";
import { ensureDailyAutoPosts } from "@/lib/social/auto-post-scheduler";

export async function POST() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await ensureDailyAutoPosts();
  const autoApprove = isSocialAutoApproveEnabled();

  return NextResponse.json({
    generated: result.generated,
    byType: result.byType,
    quotas: result.quotas,
    existing: result.existing,
    autoApproved: autoApprove,
    skipped: result.skipped,
  });
}
