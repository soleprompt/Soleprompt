export const TRACKED_TOOLS = [
  {
    slug: "x-checker",
    label: "X Checker",
    description: "Free X reputation scan (X Tracker)",
    path: "/tools/x-checker",
  },
  {
    slug: "x-scrubber",
    label: "X Scrubber",
    description: "Premium tweet deletion tool",
    path: "/buyer/scrubber",
  },
  {
    slug: "social-tools",
    label: "Social Tools",
    description: "Social scrubbing suite hub",
    path: "/buyer/social",
  },
  {
    slug: "social-facebook",
    label: "Facebook Scrubber",
    description: "Facebook content cleanup",
    path: "/buyer/social/facebook",
  },
  {
    slug: "social-instagram",
    label: "Instagram Scrubber",
    description: "Instagram content cleanup",
    path: "/buyer/social/instagram",
  },
  {
    slug: "social-linkedin",
    label: "LinkedIn Scrubber",
    description: "LinkedIn content cleanup",
    path: "/buyer/social/linkedin",
  },
] as const;

export type TrackedToolSlug = (typeof TRACKED_TOOLS)[number]["slug"];

export function socialPlatformToolSlug(
  platform: "facebook" | "instagram" | "linkedin",
): TrackedToolSlug {
  return `social-${platform}`;
}
