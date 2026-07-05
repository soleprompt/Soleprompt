import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  getCheckoutSessionAmount,
  getCheckoutSessionCurrency,
  getStripe,
  getStripePaymentId,
  isStripeConfigured,
} from "../src/lib/stripe";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type BackfillStats = {
  stripeSessionsProcessed: number;
  stripeCreated: number;
  stripeUpdated: number;
  stripeSkipped: number;
  stripeErrors: number;
  orphanPurchasesProcessed: number;
  orphanUpdated: number;
  orphanErrors: number;
};

async function backfillStripeSessions(
  completePurchase: typeof import("../src/lib/purchase-fulfillment").completePurchase,
  stats: BackfillStats,
) {
  if (!isStripeConfigured()) {
    console.log("Skipping Stripe session backfill: STRIPE_SECRET_KEY is not configured.");
    return;
  }

  const stripe = getStripe();
  let startingAfter: string | undefined;

  do {
    const page = await stripe.checkout.sessions.list({
      limit: 100,
      status: "complete",
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const session of page.data) {
      stats.stripeSessionsProcessed += 1;

      if (session.payment_status !== "paid") {
        stats.stripeSkipped += 1;
        continue;
      }

      const promptId = session.metadata?.promptId;
      const buyerId = session.metadata?.buyerId;

      if (!promptId || !buyerId) {
        stats.stripeSkipped += 1;
        continue;
      }

      const prompt = await prisma.prompt.findFirst({
        where: { id: promptId },
        select: { price: true },
      });

      if (!prompt) {
        stats.stripeSkipped += 1;
        continue;
      }

      try {
        const result = await completePurchase({
          promptId,
          buyerId,
          amount: getCheckoutSessionAmount(session, prompt.price),
          currency: getCheckoutSessionCurrency(session),
          stripeSessionId: session.id,
          stripePaymentId: getStripePaymentId(session),
          purchasedAt: new Date(session.created * 1000),
          actorId: null,
          quiet: true,
        });

        if (result.created) {
          stats.stripeCreated += 1;
        } else if (result.updated) {
          stats.stripeUpdated += 1;
        } else {
          stats.stripeSkipped += 1;
        }
      } catch (error) {
        stats.stripeErrors += 1;
        console.error(
          `[backfill] Failed to sync Stripe session ${session.id}:`,
          error,
        );
      }
    }

    startingAfter =
      page.has_more && page.data.length > 0
        ? page.data[page.data.length - 1].id
        : undefined;
  } while (startingAfter);
}

async function backfillOrphanPurchases(
  syncPurchaseRecord: typeof import("../src/lib/purchase-fulfillment").syncPurchaseRecord,
  stats: BackfillStats,
) {
  const orphans = await prisma.purchase.findMany({
    where: {
      status: "completed",
      transaction: null,
    },
    select: {
      id: true,
    },
    orderBy: { createdAt: "asc" },
  });

  for (const purchase of orphans) {
    stats.orphanPurchasesProcessed += 1;

    try {
      const result = await syncPurchaseRecord(purchase.id, { quiet: true });

      if (result.updated) {
        stats.orphanUpdated += 1;
      }
    } catch (error) {
      stats.orphanErrors += 1;
      console.error(
        `[backfill] Failed to sync orphan purchase ${purchase.id}:`,
        error,
      );
    }
  }
}

async function main() {
  const { completePurchase, syncPurchaseRecord } = await import(
    "../src/lib/purchase-fulfillment"
  );

  const stats: BackfillStats = {
    stripeSessionsProcessed: 0,
    stripeCreated: 0,
    stripeUpdated: 0,
    stripeSkipped: 0,
    stripeErrors: 0,
    orphanPurchasesProcessed: 0,
    orphanUpdated: 0,
    orphanErrors: 0,
  };

  console.log("Starting Stripe purchase backfill...");
  await backfillStripeSessions(completePurchase, stats);
  console.log("Backfilling purchases missing transactions...");
  await backfillOrphanPurchases(syncPurchaseRecord, stats);

  const [completedPurchases, transactionCount, revenueResult, stripePayments] =
    await Promise.all([
      prisma.purchase.count({ where: { status: "completed" } }),
      prisma.transaction.count({ where: { status: "completed" } }),
      prisma.transaction.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
      }),
      prisma.transaction.count({
        where: {
          status: "completed",
          OR: [
            { stripeSessionId: { not: null } },
            { stripePaymentId: { not: null } },
          ],
        },
      }),
    ]);

  console.log("\nBackfill complete:");
  console.log(JSON.stringify(stats, null, 2));
  console.log("\nDatabase totals:");
  console.log(
    JSON.stringify(
      {
        completedPurchases,
        transactionCount,
        grossRevenue: revenueResult._sum.amount ?? 0,
        stripePayments,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
