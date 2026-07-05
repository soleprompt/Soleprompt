import { Resend } from "resend";
import { formatCurrency, formatDate } from "@/lib/format";

export type PurchaseReceiptDetails = {
  to: string;
  promptTitle: string;
  amount: number;
  purchasedAt: Date;
  promptUrl: string;
  purchasesUrl: string;
};

export type SellerSaleNotificationDetails = {
  to: string;
  sellerName: string;
  promptTitle: string;
  amount: number;
  soldAt: Date;
  salesUrl: string;
  earningsUrl: string;
};

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getEmailFrom(): string | null {
  const from = process.env.EMAIL_FROM?.trim();
  return from || null;
}

export function isEmailConfigured(): boolean {
  return Boolean(getResendClient() && getEmailFrom());
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildReceiptHtml(details: PurchaseReceiptDetails): string {
  const { promptTitle, amount, purchasedAt, promptUrl, purchasesUrl } =
    details;
  const priceLabel = amount <= 0 ? "Free" : formatCurrency(amount);
  const dateLabel = formatDate(purchasedAt);

  return `
<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111;">
    <h1 style="font-size: 20px; margin-bottom: 8px;">Thanks for your purchase</h1>
    <p>Your SolePrompt order is confirmed.</p>
    <table style="margin: 24px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 4px 16px 4px 0; color: #666;">Prompt</td>
        <td style="padding: 4px 0;"><strong>${escapeHtml(promptTitle)}</strong></td>
      </tr>
      <tr>
        <td style="padding: 4px 16px 4px 0; color: #666;">Amount</td>
        <td style="padding: 4px 0;">${escapeHtml(priceLabel)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 16px 4px 0; color: #666;">Date</td>
        <td style="padding: 4px 0;">${escapeHtml(dateLabel)}</td>
      </tr>
    </table>
    <p>
      <a href="${promptUrl}" style="color: #2563eb;">View your prompt</a>
      &nbsp;·&nbsp;
      <a href="${purchasesUrl}" style="color: #2563eb;">My Purchases</a>
    </p>
    <p style="margin-top: 32px; font-size: 13px; color: #666;">
      If you have questions, reply to this email.
    </p>
  </body>
</html>
`.trim();
}

function buildReceiptText(details: PurchaseReceiptDetails): string {
  const { promptTitle, amount, purchasedAt, promptUrl, purchasesUrl } =
    details;
  const priceLabel = amount <= 0 ? "Free" : formatCurrency(amount);
  const dateLabel = formatDate(purchasedAt);

  return [
    "Thanks for your purchase!",
    "",
    "Your SolePrompt order is confirmed.",
    "",
    `Prompt: ${promptTitle}`,
    `Amount: ${priceLabel}`,
    `Date: ${dateLabel}`,
    "",
    `View your prompt: ${promptUrl}`,
    `My Purchases: ${purchasesUrl}`,
  ].join("\n");
}

function buildSellerSaleHtml(details: SellerSaleNotificationDetails): string {
  const { sellerName, promptTitle, amount, soldAt, salesUrl, earningsUrl } =
    details;
  const priceLabel = amount <= 0 ? "Free" : formatCurrency(amount);
  const dateLabel = formatDate(soldAt);

  return `
<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111;">
    <h1 style="font-size: 20px; margin-bottom: 8px;">You made a sale!</h1>
    <p>Hi ${escapeHtml(sellerName)}, great news — someone just purchased your prompt on SolePrompt.</p>
    <table style="margin: 24px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 4px 16px 4px 0; color: #666;">Prompt</td>
        <td style="padding: 4px 0;"><strong>${escapeHtml(promptTitle)}</strong></td>
      </tr>
      <tr>
        <td style="padding: 4px 16px 4px 0; color: #666;">Amount</td>
        <td style="padding: 4px 0;">${escapeHtml(priceLabel)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 16px 4px 0; color: #666;">Date</td>
        <td style="padding: 4px 0;">${escapeHtml(dateLabel)}</td>
      </tr>
    </table>
    <p>
      <a href="${salesUrl}" style="color: #2563eb;">View sales</a>
      &nbsp;·&nbsp;
      <a href="${earningsUrl}" style="color: #2563eb;">View earnings</a>
    </p>
  </body>
</html>
`.trim();
}

function buildSellerSaleText(details: SellerSaleNotificationDetails): string {
  const { sellerName, promptTitle, amount, soldAt, salesUrl, earningsUrl } =
    details;
  const priceLabel = amount <= 0 ? "Free" : formatCurrency(amount);
  const dateLabel = formatDate(soldAt);

  return [
    `Hi ${sellerName}, you made a sale!`,
    "",
    `Prompt: ${promptTitle}`,
    `Amount: ${priceLabel}`,
    `Date: ${dateLabel}`,
    "",
    `View sales: ${salesUrl}`,
    `View earnings: ${earningsUrl}`,
  ].join("\n");
}

export async function sendPurchaseReceipt(
  details: PurchaseReceiptDetails,
): Promise<void> {
  const to = details.to.trim();
  if (!to) {
    console.warn("[email] Skipping purchase receipt: buyer email is missing.");
    return;
  }

  const resend = getResendClient();
  const from = getEmailFrom();

  if (!resend || !from) {
    console.warn(
      "[email] Skipping purchase receipt: RESEND_API_KEY and EMAIL_FROM must be set.",
    );
    return;
  }

  const subject = `Receipt: ${details.promptTitle}`;

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html: buildReceiptHtml(details),
    text: buildReceiptText(details),
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendSellerSaleNotification(
  details: SellerSaleNotificationDetails,
): Promise<void> {
  const to = details.to.trim();
  if (!to) {
    console.warn(
      "[email] Skipping seller sale notification: seller email is missing.",
    );
    return;
  }

  const resend = getResendClient();
  const from = getEmailFrom();

  if (!resend || !from) {
    console.warn(
      "[email] Skipping seller sale notification: RESEND_API_KEY and EMAIL_FROM must be set.",
    );
    return;
  }

  const subject = `You made a sale: ${details.promptTitle}`;

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html: buildSellerSaleHtml(details),
    text: buildSellerSaleText(details),
  });

  if (error) {
    throw new Error(error.message);
  }
}
