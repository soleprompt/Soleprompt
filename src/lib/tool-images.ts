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
  };

export function getToolCoverImage(
  title: string,
  categorySlug: ToolCategorySlug,
): string {
  return (
    TOOL_COVER_IMAGES[title] ??
    CATEGORY_COVER_IMAGES[categorySlug] ??
    "/tools/categories/business.svg"
  );
}

export function getCategoryCoverImage(categorySlug: string): string {
  const slug = categorySlug.toLowerCase().replace(/\s+/g, "-") as ToolCategorySlug;
  return CATEGORY_COVER_IMAGES[slug] ?? "/tools/categories/business.svg";
}

export function getCategoryHeaderImage(categorySlug: string): string | null {
  const slug = categorySlug.toLowerCase().replace(/\s+/g, "-") as ToolCategorySlug;
  return CATEGORY_HEADER_IMAGES[slug] ?? null;
}
