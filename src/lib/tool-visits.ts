import { prisma } from "@/lib/db";
import { safeDbRead } from "@/lib/safe-db";
import type { UtmAttribution } from "@/lib/utm";
import {
  TRACKED_TOOLS,
  type TrackedToolSlug,
} from "@/lib/tool-visits/constants";

export type ToolVisitStat = {
  slug: TrackedToolSlug;
  label: string;
  description: string;
  path: string;
  totalVisits: number;
  visitsLast7Days: number;
};

export { socialPlatformToolSlug } from "@/lib/tool-visits/constants";

export async function recordToolVisit(
  toolSlug: TrackedToolSlug,
  clerkUserId?: string | null,
  attribution?: UtmAttribution,
): Promise<void> {
  try {
    let userId: string | undefined;

    if (clerkUserId) {
      const user = await prisma.user.findUnique({
        where: { clerkUserId },
        select: { id: true },
      });
      userId = user?.id;
    }

    await prisma.toolVisit.create({
      data: {
        toolSlug,
        userId,
        utmSource: attribution?.utmSource,
        utmCampaign: attribution?.utmCampaign,
      },
    });
  } catch {
    // Tracking should never block tool pages.
  }
}

export async function getToolVisitStats(): Promise<ToolVisitStat[]> {
  return safeDbRead(
    TRACKED_TOOLS.map((tool) => ({
      slug: tool.slug,
      label: tool.label,
      description: tool.description,
      path: tool.path,
      totalVisits: 0,
      visitsLast7Days: 0,
    })),
    async () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [totalCounts, recentCounts] = await Promise.all([
        prisma.toolVisit.groupBy({
          by: ["toolSlug"],
          _count: { id: true },
        }),
        prisma.toolVisit.groupBy({
          by: ["toolSlug"],
          where: { visitedAt: { gte: sevenDaysAgo } },
          _count: { id: true },
        }),
      ]);

      const totalBySlug = new Map(
        totalCounts.map((row) => [row.toolSlug, row._count.id]),
      );
      const recentBySlug = new Map(
        recentCounts.map((row) => [row.toolSlug, row._count.id]),
      );

      return TRACKED_TOOLS.map((tool) => ({
        slug: tool.slug,
        label: tool.label,
        description: tool.description,
        path: tool.path,
        totalVisits: totalBySlug.get(tool.slug) ?? 0,
        visitsLast7Days: recentBySlug.get(tool.slug) ?? 0,
      }));
    },
  );
}
