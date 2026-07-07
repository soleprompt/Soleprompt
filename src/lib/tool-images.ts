import { getGeneratedToolPreviewUrl } from "@/lib/tool-preview-svg";

export type ToolCategorySlug =
  | "productivity"
  | "business"
  | "marketing"
  | "sales"
  | "solar"
  | "coding"
  | "finance"
  | "writing"
  | "education";

/** Local public asset paths for prompt cover images (served from /public). */
export const TOOL_COVER_IMAGES: Record<string, string> = {
  // Solar tools
  "Solar ROI Calculator": "/tools/solar-roi-calculator.svg",
  "Electric Bill → Savings Estimator": "/tools/electric-bill-savings.svg",
  "Solar Lead Qualifier Script": "/tools/solar-lead-qualifier.svg",
  "Roof Suitability Checklist Prompt": "/tools/roof-suitability-checklist.svg",
  "Solar Objection Handler (Homeowner FAQs)":
    "/tools/solar-objection-handler.svg",
  "Solar Sales AI Pack": "/tools/solar-sales-ai-pack.svg",
  "Solar Proposal Generator Pack": "/tools/solar-proposal-generator-pack.svg",

  // Homepage featured tools
  "X Scrubbing Tool — Delete Risky Tweets & Clean Your Brand":
    "/tools/x-scrubbing-tool.svg",
  "Cold Outreach Email Writer": "/tools/cold-outreach-email.svg",
  "Resume Bullet Improver": "/tools/resume-bullet-improver.svg",

  // Other high-visibility bundles
  "Welcome Pack - 10 Free AI Prompts": "/tools/welcome-pack.svg",
  "Social Scrubbing Suite — Facebook, Instagram & LinkedIn":
    "/tools/social-scrubbing-suite.svg",
  "Productivity Power Pack": "/tools/productivity-power-pack.svg",
  "Freelancer Essentials Bundle": "/tools/freelancer-essentials-bundle.svg",
  "Social Media Growth Bundle": "/tools/social-media-growth-bundle.svg",
  "Startup Launch Pack": "/tools/startup-launch-pack.svg",
  "Developer Quick Wins Pack": "/tools/developer-quick-wins-pack.svg",
  "Personal Finance Toolkit": "/tools/personal-finance-toolkit.svg",
  "Teacher's Classroom AI Pack": "/tools/teachers-classroom-ai-pack.svg",
  "LinkedIn Authority Builder": "/tools/linkedin-authority-builder.svg",
  "Email Marketing Mastery Pack": "/tools/email-marketing-mastery-pack.svg",
  "Social Media Scrubbing Pack": "/tools/social-media-scrubbing-pack.svg",
  "Complete AI Starter Mega Pack": "/tools/complete-ai-starter-mega-pack.svg",
  "Client Proposal Generator": "/tools/client-proposal-generator.svg",
};

export const CATEGORY_COVER_IMAGES: Record<ToolCategorySlug, string> = {
  productivity: "/tools/categories/productivity.svg",
  business: "/tools/categories/business.svg",
  marketing: "/tools/categories/marketing.svg",
  sales: "/tools/categories/sales.svg",
  solar: "/tools/categories/solar.svg",
  coding: "/tools/categories/coding.svg",
  finance: "/tools/categories/finance.svg",
  writing: "/tools/categories/writing.svg",
  education: "/tools/categories/education.svg",
};

export const CATEGORY_HEADER_IMAGES: Partial<Record<ToolCategorySlug, string>> =
  {
    solar: "/categories/solar-header.svg",
    sales: "/categories/sales-header.svg",
    business: "/categories/business-header.svg",
    marketing: "/categories/marketing-header.svg",
    productivity: "/categories/productivity-header.svg",
    coding: "/categories/coding-header.svg",
    finance: "/categories/finance-header.svg",
    writing: "/categories/writing-header.svg",
    education: "/categories/education-header.svg",
  };

/** Header images for slugs outside ToolCategorySlug (e.g. social-media). */
export const CATEGORY_HEADER_ALIASES: Record<string, string> = {
  "social-media": "/categories/social-media-header.svg",
};

export function getToolCoverImage(
  title: string,
  categorySlug: ToolCategorySlug,
): string {
  if (TOOL_COVER_IMAGES[title]) {
    return TOOL_COVER_IMAGES[title];
  }
  return getGeneratedToolPreviewUrl(title, categorySlug);
}

export function getCategoryCoverImage(categorySlug: string): string {
  const slug = categorySlug.toLowerCase().replace(/\s+/g, "-") as ToolCategorySlug;
  return CATEGORY_COVER_IMAGES[slug] ?? "/tools/categories/business.svg";
}

export function getCategoryHeaderImage(categorySlug: string): string | null {
  const slug = categorySlug.toLowerCase().replace(/\s+/g, "-");
  return (
    CATEGORY_HEADER_ALIASES[slug] ??
    CATEGORY_HEADER_IMAGES[slug as ToolCategorySlug] ??
    null
  );
}

/** Next.js image optimization rejects SVG and dynamic previews — serve them unoptimized. */
export function isSvgImageSrc(src: string): boolean {
  return (
    src.startsWith("data:") ||
    src.includes("/api/tool-preview") ||
    /\.svg($|\?)/i.test(src)
  );
}

function isPersistedCoverUrl(url: string): boolean {
  return (
    url.startsWith("/tools/") ||
    url.startsWith("/categories/") ||
    (url.startsWith("https://") && !url.includes("placehold.co"))
  );
}

export function resolvePromptCoverImage(prompt: {
  title: string;
  category: string;
  coverImageUrl: string | null;
}): string {
  const url = prompt.coverImageUrl?.trim();
  if (url && isPersistedCoverUrl(url)) {
    return url;
  }

  const slug = prompt.category.toLowerCase().replace(/\s+/g, "-") as ToolCategorySlug;
  return getToolCoverImage(prompt.title, slug);
}
