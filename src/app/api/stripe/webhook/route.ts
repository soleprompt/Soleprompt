import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { completePurchase } from "@/lib/purchase-fulfillment";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const runtime = "nodejs";

function getWebhookSecret(): string | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  return secret || null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;

  const promptId = session.metadata?.promptId;
  const buyerId = session.metadata?.buyerId;

  if (!promptId || !buyerId) {
    console.error("[stripe] checkout.session.completed missing metadata");
    return;
  }

  const amount =
    typeof session.amount_total === "number" ? session.amount_total / 100 : 0;

  await completePurchase({
    promptId,
    buyerId,
    amount,
    stripeSessionId: session.id,
    actorId: null,
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
  } catch (error) {
    console.error("[stripe] Webhook handler failed:", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
