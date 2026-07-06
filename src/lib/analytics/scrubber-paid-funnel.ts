import type { Prisma } from "@/generated/prisma/client";
import { livePurchaseWhere } from "@/lib/admin-data";
import { prisma } from "@/lib/db";
import { safeDbRead } from "@/lib/safe-db";
import { getScrubberProductId } from "@/lib/scrubber/access";
import { X_SCRUBBER_PRODUCT_KEY, X_SCRUBBER_PRODUCT_TITLE } from "@/lib/scrubber/constants";
import {
  getUtcDayBounds,
  type TodayFunnelStats,
  type TodayFunnelStep,
} from "@/lib/analytics/today-funnel";

export type ScrubberPaidFunnelStats = TodayFunnelStats;

const EMPTY_FUNNEL: ScrubberPaidFunnelStats = {
  dateLabel: "",
  steps: [],
  conversionRate: 0,
  revenueToday: 0,
};

const SCRUBBER_UNLOCK_SOURCE = "locked-page";

function clickedTodayRange(start: Date, end: Date): Prisma.ClickThroughWhereInput {
  return { clickedAt: { gte: start, lt: end } };
}

function visitedTodayRange(start: Date, end: Date): Prisma.ToolVisitWhereInput {
  return { visitedAt: { gte: start, lt: end } };
}

function stepRate(value: number, prior: number): number | undefined {
  if (prior <= 0) return undefined;
  return (value / prior) * 100;
}

function scrubberUnlockClickWhere(
  start: Date,
  end: Date,
): Prisma.ClickThroughWhereInput {
  return {
    ...clickedTodayRange(start, end),
    eventType: "paid_tool_cta",
    targetKey: "x-scrubber",
    metadata: { path: ["source"], equals: SCRUBBER_UNLOCK_SOURCE },
  };
}

function scrubberCheckoutStartedWhere(
  start: Date,
  end: Date,
  productId: string | null,
): Prisma.ClickThroughWhereInput {
  const productFilters: Prisma.ClickThroughWhereInput[] = [
    { metadata: { path: ["productKey"], equals: X_SCRUBBER_PRODUCT_KEY } },
    { metadata: { path: ["promptTitle"], equals: X_SCRUBBER_PRODUCT_TITLE } },
  ];

  if (productId) {
    productFilters.unshift({ targetKey: productId });
  }

  return {
    ...clickedTodayRange(start, end),
    eventType: "checkout_started",
    OR: productFilters,
  };
}

function scrubberPurchaseWhere(start: Date, end: Date): Prisma.PurchaseWhereInput {
  return {
    ...livePurchaseWhere,
    status: "completed",
    amount: { gt: 0 },
    createdAt: { gte: start, lt: end },
    prompt: { title: X_SCRUBBER_PRODUCT_TITLE },
  };
}

/**
 * Aggregates X Scrubber paid funnel metrics for the current UTC calendar day.
 *
 * - Scrubber page viewed: `ToolVisit` for slug `x-scrubber`.
 * - Unlock Scrubber clicked: `paid_tool_cta` on the locked scrubber page (`source: locked-page`).
 * - Checkout started: `checkout_started` for the scrubber product (by id, title, or productKey).
 * - Purchase completed: live completed purchases of the scrubber product.
 */
export async function getScrubberPaidFunnelStats(): Promise<ScrubberPaidFunnelStats> {
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
      const productId = await getScrubberProductId();

      const [
        pageViews,
        unlockClicks,
        checkoutStarted,
        purchased,
        revenueResult,
      ] = await Promise.all([
        prisma.toolVisit.count({
          where: { toolSlug: "x-scrubber", ...visitedTodayRange(start, end) },
        }),
        prisma.clickThrough.count({
          where: scrubberUnlockClickWhere(start, end),
        }),
        prisma.clickThrough.count({
          where: scrubberCheckoutStartedWhere(start, end, productId),
        }),
        prisma.purchase.count({ where: scrubberPurchaseWhere(start, end) }),
        prisma.purchase.aggregate({
          where: scrubberPurchaseWhere(start, end),
          _sum: { amount: true },
        }),
      ]);

      const revenueToday = revenueResult._sum.amount ?? 0;
      const conversionRate = pageViews > 0 ? (purchased / pageViews) * 100 : 0;

      const rawSteps: Omit<TodayFunnelStep, "stepRate">[] = [
        {
          key: "page-viewed",
          label: "👁️ Scrubber page viewed",
          value: pageViews,
        },
        {
          key: "unlock-clicked",
          label: '🖱️ "Unlock Scrubber" clicked',
          value: unlockClicks,
        },
        {
          key: "checkout-started",
          label: "💳 Checkout started",
          value: checkoutStarted,
        },
        {
          key: "purchase-completed",
          label: "✅ Purchase completed",
          value: purchased,
        },
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
