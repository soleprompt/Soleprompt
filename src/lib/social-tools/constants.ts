/** Marketplace title — also used for purchase-gating social scrubber tools. */
export const SOCIAL_SUITE_PRODUCT_TITLE =
  "Social Scrubbing Suite — Facebook, Instagram & LinkedIn";

export type SocialToolPlatform = "facebook" | "instagram" | "linkedin";

export const SOCIAL_TOOL_PLATFORMS: SocialToolPlatform[] = [
  "facebook",
  "instagram",
  "linkedin",
];

export const SOCIAL_TOOL_LABELS: Record<SocialToolPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
};

export const SOCIAL_TOOL_DESCRIPTIONS: Record<SocialToolPlatform, string> = {
  facebook:
    "Connect your Facebook profile, scan posts for brand risk, and remove selected content with confirmation.",
  instagram:
    "Connect your Instagram account, review captions and media for brand risk, and clean up selected posts.",
  linkedin:
    "Connect your LinkedIn profile, audit posts and activity for professional risk, and remove selected content.",
};
