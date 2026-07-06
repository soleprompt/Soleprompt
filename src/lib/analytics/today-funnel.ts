import type { Prisma } from "@/generated/prisma/client";
import { livePurchaseWhere } from "@/lib/admin-data";
import { prisma } from "@/lib/db";
import { safeDbRead } from "@/lib/safe-db";

/** UTC calendar day bounds (midnight–midnight UTC). */
export function getUtcDayBounds(date = new Date()): { start: Date; end: Date } {
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export type TodayFunnelStep = {
  key: string;
  label: string;
  value: number;
  /** Share of the prior funnel step (0–100), omitted for the first step. */
  stepRate?: number;
};

export type TodayFunnelStats = {
  /** UTC date label for the funnel window. */
  dateLabel: string;
  steps: TodayFunnelStep[];
  conversionRate: number;
  revenueToday: number;
};

const EMPTY_FUNNEL: TodayFunnelStats = {
  dateLabel: "",
  steps: [],
  conversionRate: 0,
  revenueToday: 0,
};

const X_CHECKER_OAUTH_SOURCE = "x-checker";

const X_CHECKER_SCRUBBER_SOURCES = [
  "x-checker-upsell",
  "x-checker-flagged-upsell",
  "x-checker-open-tool",
] as const;

function clickedTodayRange(start: Date, end: Date): Prisma.ClickThroughWhereInput {
  return { clickedAt: { gte: start, lt: end } };
}

function visitedTodayRange(start: Date, end: Date): Prisma.ToolVisitWhereInput {
  return { visitedAt: { gte: start, lt: end } };
}

function xCheckerScrubberClickWhere(
  start: Date,
  end: Date,
): Prisma.ClickThroughWhereInput {
  return {
    ...clickedTodayRange(start, end),
    targetKey: "x-scrubber",
    eventType: { in: ["upgrade_prompt", "paid_tool_cta"] },
    OR: X_CHECKER_SCRUBBER_SOURCES.map((source) => ({
      metadata: { path: ["source"], equals: source },
    })),
  };
}

function stepRate(value: number, prior: number): number | undefined {
  if (prior <= 0) return undefined;
  return (value / prior) * 100;
}

/**
 * Aggregates X Checker funnel metrics for the current UTC calendar day.
 *
 * Metric definitions:
 * - Visitors Today: total tool page views across all tracked tools (repeat visits counted).
 * - X Checker Visits: tool visits for slug `x-checker`.
 * - Connect X Clicks: `oauth_connect` for target `x` with source `x-checker`.
 * - Successful Scans: `successful_scan` events for `x-checker`.
 * - Score Shared: `share_score` for `x-checker`.
 * - Clicked "Buy Scrubber": scrubber upsell CTAs from the X Checker flow.
 * - Checkout Started: all `checkout_started` events today.
 * - Purchased: completed live purchases with amount > 0 today.
 * - Conversion Rate: Purchased / X Checker Visits × 100.
 * - Revenue Today: sum of paid completed live purchase amounts today.
 */
export async function getTodayFunnelStats(): Promise<TodayFunnelStats> {
  const { start, end } = getUtcDayBounds();
  const dateLabel = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return safeDbRead(
    { ...EMPTY_FUNNEL, dateLabel },
    async () => {
      const completedPaidToday = {
        ...livePurchaseWhere,
        status: "completed" as const,
        amount: { gt: 0 },
        createdAt: { gte: start, lt: end },
      };

      const [
        visitorsToday,
        xCheckerVisits,
        connectXClicks,
        successfulScans,
        scoreShared,
        buyScrubberClicks,
        checkoutStarted,
        purchased,
        revenueResult,
      ] = await Promise.all([
        prisma.toolVisit.count({ where: visitedTodayRange(start, end) }),
        prisma.toolVisit.count({
          where: { toolSlug: "x-checker", ...visitedTodayRange(start, end) },
        }),
        prisma.clickThrough.count({
          where: {
            ...clickedTodayRange(start, end),
            eventType: "oauth_connect",
            targetKey: "x",
            metadata: { path: ["source"], equals: X_CHECKER_OAUTH_SOURCE },
          },
        }),
        prisma.clickThrough.count({
          where: {
            ...clickedTodayRange(start, end),
            eventType: "successful_scan",
            targetKey: "x-checker",
          },
        }),
        prisma.clickThrough.count({
          where: {
            ...clickedTodayRange(start, end),
            eventType: "share_score",
            targetKey: "x-checker",
          },
        }),
        prisma.clickThrough.count({
          where: xCheckerScrubberClickWhere(start, end),
        }),
        prisma.clickThrough.count({
          where: {
            ...clickedTodayRange(start, end),
            eventType: "checkout_started",
          },
        }),
        prisma.purchase.count({ where: completedPaidToday }),
        prisma.purchase.aggregate({
          where: completedPaidToday,
          _sum: { amount: true },
        }),
      ]);

      const revenueToday = revenueResult._sum.amount ?? 0;
      const conversionRate =
        xCheckerVisits > 0 ? (purchased / xCheckerVisits) * 100 : 0;

      const rawSteps: Omit<TodayFunnelStep, "stepRate">[] = [
        { key: "visitors", label: "Visitors Today", value: visitorsToday },
        { key: "x-checker-visits", label: "X Checker Visits", value: xCheckerVisits },
        { key: "connect-x", label: "Connect X Clicks", value: connectXClicks },
        { key: "successful-scans", label: "Successful Scans", value: successfulScans },
        { key: "score-shared", label: "Score Shared", value: scoreShared },
        {
          key: "buy-scrubber",
          label: 'Clicked "Buy Scrubber"',
          value: buyScrubberClicks,
        },
        { key: "checkout-started", label: "Checkout Started", value: checkoutStarted },
        { key: "purchased", label: "Purchased", value: purchased },
      ];

      const steps: TodayFunnelStep[] = rawSteps.map((step, index) => {
        const prior = index > 0 ? rawSteps[index - 1]!.value : 0;
        return {
          ...step,
          stepRate: index > 0 ? stepRate(step.value, prior) : undefined,
        };
      });

      return {
        dateLabel,
        steps,
        conversionRate,
        revenueToday,
      };
    },
  );
}
