import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [repliesSent, metricsAgg, withMetrics] = await Promise.all([
    prisma.socialReply.count({ where: { status: "posted" } }),
    prisma.socialReply.aggregate({
      where: { status: "posted" },
      _sum: {
        likeCount: true,
        impressionCount: true,
        replyCount: true,
        profileVisitCount: true,
        followerGain: true,
      },
    }),
    prisma.socialReply.count({
      where: {
        status: "posted",
        metricsFetchedAt: { not: null },
      },
    }),
  ]);

  const postedWithIds = await prisma.socialReply.count({
    where: {
      status: "posted",
      xReplyId: { not: null },
    },
  });

  return NextResponse.json({
    repliesSent,
    likesReceived: metricsAgg._sum.likeCount ?? 0,
    replyImpressions: metricsAgg._sum.impressionCount ?? 0,
    repliesOnPosts: metricsAgg._sum.replyCount ?? 0,
    profileVisits: metricsAgg._sum.profileVisitCount ?? 0,
    followersGained: metricsAgg._sum.followerGain ?? 0,
    metricsTracked: withMetrics,
    postedWithIds,
    placeholders: {
      profileVisits: "Requires X analytics API — stored when available",
      followersGained: "Requires X analytics API — stored when available",
    },
  });
}
