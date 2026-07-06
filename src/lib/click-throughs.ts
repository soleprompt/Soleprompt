import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  clickThroughStatKey,
  formatClickThroughLabel,
  isClickThroughEventType,
  type ClickThroughEventType,
} from "@/lib/click-throughs/constants";
import { safeDbRead } from "@/lib/safe-db";

export type ClickThroughMetadata = Record<
  string,
  string | number | boolean | null
>;

export type RecordClickThroughInput = {
  eventType: ClickThroughEventType;
  targetKey: string;
  metadata?: ClickThroughMetadata;
  clerkUserId?: string | null;
};

export type ClickThroughStat = {
  key: string;
  eventType: string;
  targetKey: string;
  label: string;
  totalClicks: number;
  clicksLast7Days: number;
};

function metadataSource(metadata: Prisma.JsonValue | null): string | undefined {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return undefined;
  }

  const source = (metadata as Record<string, unknown>).source;
  return typeof source === "string" ? source : undefined;
}

function metadataForLabel(
  metadata: Prisma.JsonValue | null,
): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  return metadata as Record<string, unknown>;
}

export async function recordClickThrough({
  eventType,
  targetKey,
  metadata,
  clerkUserId,
}: RecordClickThroughInput): Promise<void> {
  if (!isClickThroughEventType(eventType)) {
    return;
  }

  try {
    let userId: string | undefined;

    if (clerkUserId) {
      const user = await prisma.user.findUnique({
        where: { clerkUserId },
        select: { id: true },
      });
      userId = user?.id;
    }

    await prisma.clickThrough.create({
      data: {
        eventType,
        targetKey,
        metadata: metadata ?? undefined,
        userId,
      },
    });
  } catch {
    // Tracking should never block user flows.
  }
}

function aggregateStatKey(
  eventType: string,
  targetKey: string,
  metadata: Prisma.JsonValue | null,
): string {
  const source = metadataSource(metadata);

  if (
    eventType === "checkout_started" ||
    eventType === "marketplace_click" ||
    eventType === "share_score" ||
    eventType === "successful_scan"
  ) {
    return `${eventType}:${targetKey}`;
  }

  return clickThroughStatKey(eventType, targetKey, source);
}

export async function getClickThroughStats(): Promise<ClickThroughStat[]> {
  return safeDbRead([], async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalRows, recentRows] = await Promise.all([
      prisma.clickThrough.groupBy({
        by: ["eventType", "targetKey", "metadata"],
        _count: { id: true },
      }),
      prisma.clickThrough.groupBy({
        by: ["eventType", "targetKey", "metadata"],
        where: { clickedAt: { gte: sevenDaysAgo } },
        _count: { id: true },
      }),
    ]);

    const aggregate = new Map<
      string,
      ClickThroughStat & { metadata: Record<string, unknown> | null }
    >();

    function upsertRow(
      row: (typeof totalRows)[number],
      field: "totalClicks" | "clicksLast7Days",
    ) {
      const key = aggregateStatKey(row.eventType, row.targetKey, row.metadata);
      const metadata = metadataForLabel(row.metadata);
      const existing = aggregate.get(key);

      if (existing) {
        existing[field] += row._count.id;
        if (!existing.metadata?.promptTitle && metadata?.promptTitle) {
          existing.metadata = metadata;
          existing.label = formatClickThroughLabel(
            row.eventType,
            row.targetKey,
            metadata,
          );
        }
        return;
      }

      aggregate.set(key, {
        key,
        eventType: row.eventType,
        targetKey: row.targetKey,
        label: formatClickThroughLabel(row.eventType, row.targetKey, metadata),
        totalClicks: field === "totalClicks" ? row._count.id : 0,
        clicksLast7Days: field === "clicksLast7Days" ? row._count.id : 0,
        metadata,
      });
    }

    for (const row of totalRows) {
      upsertRow(row, "totalClicks");
    }

    for (const row of recentRows) {
      upsertRow(row, "clicksLast7Days");
    }

    return Array.from(aggregate.values())
      .map(({ metadata, ...stat }) => {
        void metadata;
        return stat;
      })
      .sort((a, b) => {
        if (b.totalClicks !== a.totalClicks) {
          return b.totalClicks - a.totalClicks;
        }
        return a.label.localeCompare(b.label);
      });
  });
}
