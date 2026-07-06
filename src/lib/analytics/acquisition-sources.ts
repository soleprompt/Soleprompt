import { getUtcDayBounds } from "@/lib/analytics/today-funnel";
import { prisma } from "@/lib/db";
import { safeDbRead } from "@/lib/safe-db";
import {
  ACQUISITION_CHANNELS,
  matchAcquisitionChannel,
  TOP_ACQUISITION_CHANNEL_KEYS,
  type AcquisitionChannelKey,
} from "@/lib/utm";

function isTopAcquisitionChannel(
  key: AcquisitionChannelKey,
): key is (typeof TOP_ACQUISITION_CHANNEL_KEYS)[number] {
  return (TOP_ACQUISITION_CHANNEL_KEYS as readonly string[]).includes(key);
}

export type AcquisitionSourceStat = {
  key: AcquisitionChannelKey;
  label: string;
  medal: string;
  totalVisits: number;
  visitsToday: number;
};

export type AcquisitionSourceStats = {
  sources: AcquisitionSourceStat[];
};

function emptySources(): AcquisitionSourceStat[] {
  return TOP_ACQUISITION_CHANNEL_KEYS.map((key) => {
    const config = ACQUISITION_CHANNELS[key];
    return {
      key,
      label: config.label,
      medal: config.medal,
      totalVisits: 0,
      visitsToday: 0,
    };
  });
}

/**
 * Visitor counts grouped by canonical acquisition channel.
 *
 * LinkedIn matches any campaign; other channels require an exact
 * utm_source + utm_campaign pair.
 */
export async function getAcquisitionSourceStats(): Promise<AcquisitionSourceStats> {
  return safeDbRead(
    { sources: emptySources() },
    async () => {
      const { start, end } = getUtcDayBounds();

      const [totalRows, todayRows] = await Promise.all([
        prisma.toolVisit.groupBy({
          by: ["utmSource", "utmCampaign"],
          where: { utmSource: { not: null } },
          _count: { id: true },
        }),
        prisma.toolVisit.groupBy({
          by: ["utmSource", "utmCampaign"],
          where: {
            utmSource: { not: null },
            visitedAt: { gte: start, lt: end },
          },
          _count: { id: true },
        }),
      ]);

      const totals = new Map<AcquisitionChannelKey, AcquisitionSourceStat>();

      function addCounts(
        rows: typeof totalRows,
        field: "totalVisits" | "visitsToday",
      ) {
        for (const row of rows) {
          const channelKey = matchAcquisitionChannel(
            row.utmSource!,
            row.utmCampaign,
          );
          if (!channelKey || !isTopAcquisitionChannel(channelKey)) {
            continue;
          }

          const config = ACQUISITION_CHANNELS[channelKey];
          const existing = totals.get(channelKey);

          if (existing) {
            existing[field] += row._count.id;
            continue;
          }

          totals.set(channelKey, {
            key: channelKey,
            label: config.label,
            medal: "medal" in config ? config.medal : "•",
            totalVisits: field === "totalVisits" ? row._count.id : 0,
            visitsToday: field === "visitsToday" ? row._count.id : 0,
          });
        }
      }

      addCounts(totalRows, "totalVisits");
      addCounts(todayRows, "visitsToday");

      const sources = TOP_ACQUISITION_CHANNEL_KEYS.map((key) => {
        const existing = totals.get(key);
        if (existing) return existing;

        const config = ACQUISITION_CHANNELS[key];
        return {
          key,
          label: config.label,
          medal: "medal" in config ? config.medal : "•",
          totalVisits: 0,
          visitsToday: 0,
        };
      }).sort((a, b) => b.totalVisits - a.totalVisits);

      return { sources };
    },
  );
}
