import type Stripe from "stripe";
import StripeClient from "stripe";

export function getCheckoutSessionAmount(
  session: Stripe.Checkout.Session,
  fallbackPrice = 0,
): number {
  if (typeof session.amount_total === "number") {
    return session.amount_total / 100;
  }

  return fallbackPrice;
}

export function getCheckoutSessionCurrency(session: Stripe.Checkout.Session): string {
  return session.currency ?? "usd";
}

export function getStripePaymentId(session: Stripe.Checkout.Session): string | null {
  if (typeof session.payment_intent === "string") {
    return session.payment_intent;
  }

  return session.payment_intent?.id ?? null;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

let stripeClient: StripeClient | null = null;

export function getStripe(): StripeClient {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripeClient) {
    stripeClient = new StripeClient(secretKey);
  }

  return stripeClient;
}

export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`;

  return "http://localhost:3000";
}

/** Stripe Checkout redirect URLs always use production domain (never Vercel preview). */
export const STRIPE_CHECKOUT_SUCCESS_URL =
  "https://getsoleprompt.com/purchase/success?session_id={CHECKOUT_SESSION_ID}";

export const STRIPE_CHECKOUT_CANCEL_URL =
  "https://getsoleprompt.com/purchase/cancel";
