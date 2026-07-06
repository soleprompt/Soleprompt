/** Marketplace title — also used for purchase-gating the scrubber tool. */
export const X_SCRUBBER_PRODUCT_TITLE =
  "X Scrubbing Tool — Delete Risky Tweets & Clean Your Brand";

export const X_SCRUBBER_PRODUCT_KEY = "x-scrubber" as const;

export function isScrubberProductTitle(title: string): boolean {
  return title === X_SCRUBBER_PRODUCT_TITLE;
}

export function scrubberCheckoutMetadata(
  promptTitle: string,
): { productKey: typeof X_SCRUBBER_PRODUCT_KEY; promptTitle: string } | null {
  if (!isScrubberProductTitle(promptTitle)) {
    return null;
  }

  return { productKey: X_SCRUBBER_PRODUCT_KEY, promptTitle };
}
