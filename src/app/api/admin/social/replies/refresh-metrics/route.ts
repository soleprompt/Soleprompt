import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { fetchTweetPublicMetrics } from "@/lib/social/fetch-tweet-metrics";

export async function POST() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posted = await prisma.socialReply.findMany({
    where: {
      status: "posted",
      xReplyId: { not: null },
    },
    select: { id: true, xReplyId: true },
    orderBy: { postedAt: "desc" },
    take: 50,
  });

  if (posted.length === 0) {
    return NextResponse.json({
      updated: 0,
      failed: 0,
      message: "No posted replies with X tweet IDs to refresh.",
    });
  }

  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const reply of posted) {
    const tweetId = reply.xReplyId!;
    const result = await fetchTweetPublicMetrics(tweetId);

    if (!result.ok) {
      failed += 1;
      errors.push(`${tweetId}: ${result.error}`);
      continue;
    }

    await prisma.socialReply.update({
      where: { id: reply.id },
      data: {
        likeCount: result.metrics.likeCount,
        impressionCount: result.metrics.impressionCount,
        replyCount: result.metrics.replyCount,
        metricsFetchedAt: new Date(),
      },
    });
    updated += 1;
  }

  return NextResponse.json({
    updated,
    failed,
    total: posted.length,
    errors: errors.slice(0, 5),
  });
}
