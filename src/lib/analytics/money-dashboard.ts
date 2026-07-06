import { livePurchaseWhere } from "@/lib/admin-data";
import { getAcquisitionSourceStats } from "@/lib/analytics/acquisition-sources";
import { getTodayFunnelStats, getUtcDayBounds } from "@/lib/analytics/today-funnel";
import { prisma } from "@/lib/db";
import { safeDbRead } from "@/lib/safe-db";

/**
 * UTC calendar week bounds (Monday 00:00 UTC through next Monday, exclusive).
 * "This week" uses the current ISO-style week in UTC, not a rolling 7-day window.
 */
export function getUtcWeekBounds(date = new Date()): { start: Date; end: Date } {
  const { start: dayStart } = getUtcDayBounds(date);
  const dayOfWeek = dayStart.getUTCDay();
  const daysFromMonday = (dayOfWeek + 6) % 7;
  const start = new Date(dayStart);
  start.setUTCDate(start.getUTCDate() - daysFromMonday);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start, end };
}

export type MoneyDashboardStats = {
  revenueToday: number;
  revenueThisWeek: number;
  averageOrder: number;
  /** Purchased ÷ X Checker Visits today (same as Today funnel). */
  conversion: number;
  topProduct: string | null;
  topTrafficSource: string | null;
  weekLabel: string;
};

const EMPTY_STATS: MoneyDashboardStats = {
  revenueToday: 0,
  revenueThisWeek: 0,
  averageOrder: 0,
  conversion: 0,
  topProduct: null,
  topTrafficSource: null,
  weekLabel: "",
};

function formatWeekLabel(start: Date, end: Date): string {
  const endInclusive = new Date(end);
  endInclusive.setUTCDate(endInclusive.getUTCDate() - 1);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  };
  const startStr = start.toLocaleDateString("en-US", opts);
  const endStr = endInclusive.toLocaleDateString("en-US", {
    ...opts,
    year: "numeric",
  });
  return `${startStr} – ${endStr}`;
}

/**
 * Money-focused admin metrics.
 *
 * - revenueToday: sum of paid completed live purchases (UTC calendar day).
 * - revenueThisWeek: same filter for the current UTC calendar week (Mon–Sun).
 * - averageOrder: revenueThisWeek ÷ paid order count this week.
 * - conversion: today's completed purchases ÷ today's X Checker visits.
 * - topProduct: prompt title with highest revenue this week.
 * - topTrafficSource: acquisition channel label with the most all-time visits.
 */
export async function getMoneyDashboardStats(): Promise<MoneyDashboardStats> {
  const { start: weekStart, end: weekEnd } = getUtcWeekBounds();
  const weekLabel = formatWeekLabel(weekStart, weekEnd);

  return safeDbRead(
    { ...EMPTY_STATS, weekLabel },
    async () => {
      const [todayFunnel, acquisitionSources] = await Promise.all([
        getTodayFunnelStats(),
        getAcquisitionSourceStats(),
      ]);

      const completedPaidWeek = {
        ...livePurchaseWhere,
        status: "completed" as const,
        amount: { gt: 0 },
        createdAt: { gte: weekStart, lt: weekEnd },
      };

      const [weekRevenueResult, weekOrderCount, topProductGroup] =
        await Promise.all([
          prisma.purchase.aggregate({
            where: completedPaidWeek,
            _sum: { amount: true },
          }),
          prisma.purchase.count({ where: completedPaidWeek }),
          prisma.purchase.groupBy({
            by: ["promptId"],
            where: completedPaidWeek,
            _sum: { amount: true },
            orderBy: { _sum: { amount: "desc" } },
            take: 1,
          }),
        ]);

      const revenueThisWeek = weekRevenueResult._sum.amount ?? 0;
      const averageOrder =
        weekOrderCount > 0 ? revenueThisWeek / weekOrderCount : 0;

      let topProduct: string | null = null;
      const topPromptId = topProductGroup[0]?.promptId;
      if (topPromptId) {
        const prompt = await prisma.prompt.findUnique({
          where: { id: topPromptId },
          select: { title: true },
        });
        topProduct = prompt?.title ?? null;
      }

      const topSource = acquisitionSources.sources[0];
      const topTrafficSource =
        topSource && topSource.totalVisits > 0 ? topSource.label : null;

      return {
        revenueToday: todayFunnel.revenueToday,
        revenueThisWeek,
        averageOrder,
        conversion: todayFunnel.conversionRate,
        topProduct,
        topTrafficSource,
        weekLabel,
      };
    },
  );
}
