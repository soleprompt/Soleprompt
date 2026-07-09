export const TRACKED_TOOLS = [
  {
    slug: "homepage",
    label: "Homepage",
    description: "Marketing homepage",
    path: "/",
  },
  {
    slug: "academy",
    label: "AI Academy",
    description: "Academy hub — learn AI and find audience tools",
    path: "/academy",
  },
  {
    slug: "academy-students",
    label: "Academy — Students",
    description: "College student AI tools",
    path: "/academy/students",
  },
  {
    slug: "academy-entrepreneurs",
    label: "Academy — Entrepreneurs",
    description: "Entrepreneur AI tools",
    path: "/academy/entrepreneurs",
  },
  {
    slug: "academy-creators",
    label: "Academy — Creators",
    description: "Content creator AI tools",
    path: "/academy/creators",
  },
  {
    slug: "academy-freelancers",
    label: "Academy — Freelancers",
    description: "Freelancer AI tools",
    path: "/academy/freelancers",
  },
  {
    slug: "academy-learners",
    label: "Academy — AI Learners",
    description: "AI learning path and starter tools",
    path: "/academy/learners",
  },
  {
    slug: "x-checker",
    label: "X Checker",
    description: "Free X reputation scan (X Tracker)",
    path: "/tools/x-checker",
  },
  {
    slug: "studio",
    label: "SolePrompt Studio",
    description: "AI YouTube video package generator — SolePrompt Studio",
    path: "/studio",
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
  {
    slug: "anime-ad-generator",
    label: "Anime Ad Generator",
    description: "Admin anime-style ad concept generator",
    path: "/admin/anime-ad",
  },
] as const;

export type TrackedToolSlug = (typeof TRACKED_TOOLS)[number]["slug"];

export function socialPlatformToolSlug(
  platform: "facebook" | "instagram" | "linkedin",
): TrackedToolSlug {
  return `social-${platform}`;
}
