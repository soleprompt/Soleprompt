const PREFERRED_REPLY_STYLES = ["helpful", "question", "founder_pov", "soft_promo"];

/**
 * Pick the best reply option from a generated batch for auto-approval.
 * Prefers helpful tone, then falls back to the first option.
 */
export function pickBestReplyOption<
  T extends { style?: string | null; replyStyle?: string | null },
>(options: T[]): T {
  if (options.length === 0) {
    throw new Error("Cannot pick from an empty reply batch.");
  }

  for (const preferred of PREFERRED_REPLY_STYLES) {
    const match = options.find(
      (option) =>
        option.style === preferred || option.replyStyle === preferred,
    );
    if (match) {
      return match;
    }
  }

  return options[0]!;
}
