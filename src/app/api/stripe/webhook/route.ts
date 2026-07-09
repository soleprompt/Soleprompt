import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { completePurchase } from "@/lib/purchase-fulfillment";
import {
  handleStudioSubscriptionCheckoutCompleted,
  handleStudioSubscriptionDeleted,
  handleStudioSubscriptionUpdated,
} from "@/lib/studio/subscription-webhook";
import {
  getCheckoutSessionAmount,
  getCheckoutSessionCurrency,
  getStripe,
  getStripePaymentId,
  isStripeConfigured,
} from "@/lib/stripe";

export const runtime = "nodejs";

function getWebhookSecret(): string | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  return secret || null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.metadata?.type === "studio_subscription") {
    await handleStudioSubscriptionCheckoutCompleted(session);
    return;
  }

  if (session.payment_status !== "paid") return;

  const promptId = session.metadata?.promptId;
  const buyerId = session.metadata?.buyerId;
  const referralCode = session.metadata?.referralCode ?? null;

  if (!promptId || !buyerId) {
    console.error("[stripe] checkout.session.completed missing metadata");
    return;
  }

  const prompt = await prisma.prompt.findFirst({
    where: { id: promptId },
    select: { price: true },
  });

  const amount = getCheckoutSessionAmount(session, prompt?.price ?? 0);

  await completePurchase({
    promptId,
    buyerId,
    amount,
    currency: getCheckoutSessionCurrency(session),
    stripeSessionId: session.id,
    stripePaymentId: getStripePaymentId(session),
    purchasedAt: new Date(session.created * 1000),
    actorId: null,
    referralCode,
  });
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 },
    );
  }

  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 503 },
    );
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe] Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.created"
    ) {
      await handleStudioSubscriptionUpdated(
        event.data.object as Stripe.Subscription,
      );
    }

    if (event.type === "customer.subscription.deleted") {
      await handleStudioSubscriptionDeleted(
        event.data.object as Stripe.Subscription,
      );
    }
  } catch (error) {
    console.error("[stripe] Webhook handler failed:", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
