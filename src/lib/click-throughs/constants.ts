export const CLICK_THROUGH_EVENT_TYPES = [
  "paid_tool_cta",
  "checkout_started",
  "marketplace_click",
  "upgrade_prompt",
  "share_score",
  "oauth_connect",
] as const;

export type ClickThroughEventType = (typeof CLICK_THROUGH_EVENT_TYPES)[number];

export const PAID_TOOL_TARGET_KEYS = ["x-scrubber", "social-suite"] as const;

export type PaidToolTargetKey = (typeof PAID_TOOL_TARGET_KEYS)[number];

export function isClickThroughEventType(
  value: string,
): value is ClickThroughEventType {
  return (CLICK_THROUGH_EVENT_TYPES as readonly string[]).includes(value);
}

export function clickThroughStatKey(
  eventType: string,
  targetKey: string,
  source?: string,
): string {
  return source ? `${eventType}:${targetKey}:${source}` : `${eventType}:${targetKey}`;
}

export function formatClickThroughLabel(
  eventType: string,
  targetKey: string,
  metadata?: Record<string, unknown> | null,
): string {
  const source = typeof metadata?.source === "string" ? metadata.source : undefined;
  const promptTitle =
    typeof metadata?.promptTitle === "string" ? metadata.promptTitle : undefined;

  switch (eventType) {
    case "paid_tool_cta":
      if (targetKey === "x-scrubber") {
        if (source === "x-checker-upsell") {
          return "X Scrubber — Upgrade from X Checker";
        }
        return "X Scrubber — Purchase CTA";
      }
      if (targetKey === "social-suite") {
        if (source === "locked-facebook") return "Social Suite — Purchase CTA (Facebook)";
        if (source === "locked-instagram") return "Social Suite — Purchase CTA (Instagram)";
        if (source === "locked-linkedin") return "Social Suite — Purchase CTA (LinkedIn)";
        return "Social Suite — Purchase CTA";
      }
      return `Paid tool CTA — ${targetKey}`;

    case "checkout_started":
      if (promptTitle) return `Checkout — ${promptTitle}`;
      return `Checkout — ${targetKey}`;

    case "marketplace_click":
      if (promptTitle) return `Marketplace — ${promptTitle}`;
      return `Marketplace click — ${targetKey}`;

    case "upgrade_prompt":
      if (targetKey === "x-scrubber") {
        if (source === "x-checker-flagged-upsell") {
          return "X Checker — Scrubber upsell (flagged tweets)";
        }
        return "X Checker — Scrubber upgrade prompt";
      }
      return `Upgrade prompt — ${targetKey}`;

    case "share_score":
      return "X Checker — Share score";

    case "oauth_connect":
      if (targetKey === "x") return "X Checker — Connect OAuth";
      if (targetKey === "facebook") return "Facebook — Connect OAuth";
      if (targetKey === "instagram") return "Instagram — Connect OAuth";
      if (targetKey === "linkedin") return "LinkedIn — Connect OAuth";
      return `OAuth connect — ${targetKey}`;

    default:
      return `${eventType} — ${targetKey}`;
  }
}
