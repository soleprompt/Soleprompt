import type { Prompt } from "@/types";

export type CategorySectionFilter =
  | { type: "bundle"; minPrice?: number }
  | { type: "free" }
  | { type: "under"; maxPrice: number }
  | { type: "keyword"; terms: string[] }
  | { type: "titles"; titles: string[] };

export interface CategoryLandingSection {
  title: string;
  description: string;
  filter: CategorySectionFilter;
  columns?: 2 | 3;
}

export interface CategoryLandingConfig {
  slug: string;
  tagline: string;
  seoTitle: string;
  seoDescription: string;
  featuredTitles: string[];
  sections: CategoryLandingSection[];
  /** When this category has few tools, surface picks from a related category */
  crossSellSlug?: string;
  crossSellLabel?: string;
}

function titleMatches(promptTitle: string, needle: string): boolean {
  const a = promptTitle.toLowerCase();
  const b = needle.toLowerCase();
  return a.includes(b) || b.includes(a);
}

export function matchPromptsByTitles(
  prompts: Prompt[],
  titles: string[],
): Prompt[] {
  const matched: Prompt[] = [];
  const used = new Set<string>();

  for (const title of titles) {
    const found = prompts.find(
      (p) => !used.has(p.id) && titleMatches(p.title, title),
    );
    if (found) {
      matched.push(found);
      used.add(found.id);
    }
  }

  return matched;
}

export function filterPromptsBySection(
  prompts: Prompt[],
  filter: CategorySectionFilter,
  excludeIds: Set<string>,
): Prompt[] {
  return prompts.filter((p) => {
    if (excludeIds.has(p.id)) return false;

    switch (filter.type) {
      case "bundle":
        return (
          p.price >= (filter.minPrice ?? 9) ||
          /pack|bundle|suite|toolkit|mega/i.test(p.title)
        );
      case "free":
        return p.price <= 0;
      case "under":
        return p.price > 0 && p.price <= filter.maxPrice;
      case "keyword":
        return filter.terms.some(
          (term) =>
            titleMatches(p.title, term) ||
            p.tags.some((t) => t.toLowerCase().includes(term.toLowerCase())),
        );
      case "titles":
        return filter.titles.some((t) => titleMatches(p.title, t));
      default:
        return false;
    }
  });
}

export const CATEGORY_LANDING: Record<string, CategoryLandingConfig> = {
  sales: {
    slug: "sales",
    tagline:
      "Cold email generators, proposal writers, discovery question frameworks, and objection handlers — AI tools built for SDRs, AEs, and founders who need to close.",
    seoTitle: "Sales AI Tools — Cold Email, Proposals & CRM Scripts",
    seoDescription:
      "Download sales AI tools: cold outreach email writers, proposal generators, discovery call scripts, and objection handlers. Instant download, no subscription.",
    featuredTitles: [
      "Cold Outreach Email Writer",
      "Client Proposal Generator",
      "Freelancer Essentials Bundle",
    ],
    sections: [
      {
        title: "Outreach & prospecting",
        description:
          "Cold emails, follow-up sequences, and LinkedIn messages that get replies.",
        filter: {
          type: "keyword",
          terms: ["outreach", "cold", "email", "linkedin", "prospect"],
        },
      },
      {
        title: "Proposals & closing",
        description:
          "Win more deals with proposal templates, discovery scripts, and close talk tracks.",
        filter: {
          type: "keyword",
          terms: ["proposal", "discovery", "objection", "close", "contract"],
        },
      },
      {
        title: "Sales bundles",
        description: "Complete workflow packs for freelancers and sales teams.",
        filter: { type: "bundle", minPrice: 9 },
        columns: 2,
      },
    ],
    crossSellSlug: "business",
    crossSellLabel: "Popular business tools for sales teams",
  },

  marketing: {
    slug: "marketing",
    tagline:
      "Campaign dashboards, ad copy generators, social scrubbing tools, and growth playbooks — professional AI marketing tools that ship results, not generic prompts.",
    seoTitle: "Marketing AI Tools — Ads, Social & Growth Campaigns",
    seoDescription:
      "AI marketing tools for ad copy, social media growth, email campaigns, and brand safety. Download instantly — calculators, generators, and workflow packs.",
    featuredTitles: [
      "X Scrubbing Tool — Delete Risky Tweets & Clean Your Brand",
      "Social Scrubbing Suite — Facebook, Instagram & LinkedIn",
      "Email Marketing Mastery Pack",
      "Social Media Growth Bundle",
    ],
    sections: [
      {
        title: "Brand safety & social",
        description:
          "Audit and clean your social presence before it costs you the deal.",
        filter: {
          type: "keyword",
          terms: ["scrub", "social", "twitter", "linkedin", "instagram", "brand"],
        },
      },
      {
        title: "Campaigns & content",
        description:
          "Ad headlines, captions, email sequences, and content calendars.",
        filter: {
          type: "keyword",
          terms: ["ad", "caption", "campaign", "content", "seo", "headline"],
        },
      },
      {
        title: "Marketing bundles",
        description: "End-to-end packs for growth teams and solo marketers.",
        filter: { type: "bundle", minPrice: 9 },
        columns: 2,
      },
    ],
  },

  business: {
    slug: "business",
    tagline:
      "Strategy templates, meeting workflows, SOP generators, and freelancer business systems — AI tools that replace hours of admin work.",
    seoTitle: "Business AI Tools — Strategy, Ops & Freelancer Systems",
    seoDescription:
      "Download business AI tools: client proposals, SOP writers, meeting summarizers, and freelancer bundles. Professional workflows, instant download.",
    featuredTitles: [
      "Freelancer Essentials Bundle",
      "Startup Launch Pack",
      "Client Proposal Generator",
      "Cold Outreach Email Writer",
    ],
    sections: [
      {
        title: "Freelancer & consulting",
        description: "Proposals, pricing, contracts prep, and client communication.",
        filter: {
          type: "keyword",
          terms: ["freelance", "client", "proposal", "invoice", "scope"],
        },
      },
      {
        title: "Operations & meetings",
        description: "SOPs, meeting notes, quarterly reviews, and team workflows.",
        filter: {
          type: "keyword",
          terms: ["meeting", "sop", "operations", "quarterly", "agenda"],
        },
      },
      {
        title: "Business bundles",
        description: "Multi-tool packs for founders and operators.",
        filter: { type: "bundle", minPrice: 9 },
        columns: 2,
      },
    ],
  },

  solar: {
    slug: "solar",
    tagline:
      "ROI calculators, lead qualification scripts, objection handlers, and premium proposal packs built for solar installers and sales teams.",
    seoTitle: "Solar AI Tools — ROI Calculators, Proposals & Sales Scripts",
    seoDescription:
      "Solar sales AI tools: ROI calculators, electric bill estimators, objection handlers, and proposal generator packs for residential solar teams.",
    featuredTitles: [
      "Solar ROI Calculator",
      "Solar Sales AI Pack",
      "Solar Proposal Generator Pack",
      "Electric Bill → Savings Estimator",
    ],
    sections: [
      {
        title: "Premium bundles",
        description:
          "Complete sales and proposal packs — generators, follow-ups, and closing scripts in one purchase.",
        filter: { type: "bundle", minPrice: 29 },
        columns: 2,
      },
      {
        title: "Quick tools",
        description:
          "Individual tools for ROI estimates, lead qualification, roof checks, and objection handling.",
        filter: { type: "under", maxPrice: 9.99 },
      },
    ],
  },

  productivity: {
    slug: "productivity",
    tagline:
      "Daily planners, focus session designers, habit stacks, and inbox zero workflows — AI productivity tools that actually stick.",
    seoTitle: "Productivity AI Tools — Planning, Focus & Habits",
    seoDescription:
      "Download productivity AI tools: daily prioritizers, weekly planners, habit designers, and focus session templates. Instant download.",
    featuredTitles: [
      "Welcome Pack - 10 Free AI Prompts",
      "Productivity Power Pack",
      "Complete AI Starter Mega Pack",
      "Daily Prioritizer",
    ],
    sections: [
      {
        title: "Free starters",
        description: "Get started at no cost — copy-paste and go.",
        filter: { type: "free" },
      },
      {
        title: "Planning & focus",
        description: "Daily, weekly, and quarterly planning systems.",
        filter: {
          type: "keyword",
          terms: ["daily", "weekly", "focus", "priorit", "goal", "quarterly"],
        },
      },
      {
        title: "Productivity bundles",
        description: "Multi-prompt packs for power users.",
        filter: { type: "bundle", minPrice: 5 },
        columns: 2,
      },
    ],
  },

  coding: {
    slug: "coding",
    tagline:
      "Code reviewers, SQL generators, API doc writers, and debugging assistants — AI dev tools that ship production-ready output.",
    seoTitle: "Developer AI Tools — Code Review, SQL & API Docs",
    seoDescription:
      "AI coding tools for code review, SQL generation, debugging, and API documentation. Built for developers who want copy-paste results.",
    featuredTitles: [
      "Developer Quick Wins Pack",
      "SQL Query Generator",
    ],
    sections: [
      {
        title: "Code & debugging",
        description: "Review, refactor, and fix code faster.",
        filter: {
          type: "keyword",
          terms: ["code", "debug", "sql", "api", "github", "review"],
        },
      },
      {
        title: "Developer bundles",
        description: "Curated packs for common dev workflows.",
        filter: { type: "bundle", minPrice: 5 },
        columns: 2,
      },
    ],
  },

  finance: {
    slug: "finance",
    tagline:
      "Budget builders, investment analyzers, invoice templates, and financial forecast tools — AI calculators for personal and business finance.",
    seoTitle: "Finance AI Tools — Budgets, Forecasts & Planning",
    seoDescription:
      "Download finance AI tools: monthly budget builders, investment analyzers, and financial planning templates. Instant download.",
    featuredTitles: [
      "Personal Finance Toolkit",
      "Monthly Budget Builder",
    ],
    sections: [
      {
        title: "Budgeting & planning",
        description: "Monthly budgets, savings plans, and spending analysis.",
        filter: {
          type: "keyword",
          terms: ["budget", "savings", "spending", "forecast", "invoice"],
        },
      },
      {
        title: "Finance bundles",
        description: "Complete financial planning toolkits.",
        filter: { type: "bundle", minPrice: 5 },
        columns: 2,
      },
    ],
  },

  writing: {
    slug: "writing",
    tagline:
      "Resume optimizers, blog outliners, email rewriters, and copy generators — AI writing tools tuned for ATS, SEO, and conversion.",
    seoTitle: "Writing AI Tools — Resumes, Blogs & Copy",
    seoDescription:
      "AI writing tools: resume bullet improvers, blog outliners, email rewriters, and ad copy generators. Professional output, instant download.",
    featuredTitles: [
      "Resume Bullet Improver",
      "Email Rewriter Pro",
      "Blog Post Outliner",
      "LinkedIn Authority Builder",
    ],
    sections: [
      {
        title: "Resumes & careers",
        description: "ATS-optimized bullets, cover letters, and LinkedIn copy.",
        filter: {
          type: "keyword",
          terms: ["resume", "ats", "cover letter", "linkedin", "career"],
        },
      },
      {
        title: "Content & copy",
        description: "Blogs, emails, headlines, and long-form content.",
        filter: {
          type: "keyword",
          terms: ["blog", "email", "copy", "headline", "content", "write"],
        },
      },
      {
        title: "Writing bundles",
        description: "Multi-tool packs for content creators.",
        filter: { type: "bundle", minPrice: 5 },
        columns: 2,
      },
    ],
  },

  education: {
    slug: "education",
    tagline:
      "Lesson plan builders, quiz generators, rubric designers, and classroom AI assistants for teachers and trainers.",
    seoTitle: "Education AI Tools — Lesson Plans, Quizzes & Rubrics",
    seoDescription:
      "AI education tools for lesson planning, assessments, rubrics, and differentiated instruction. Built for teachers and instructional designers.",
    featuredTitles: [
      "Teacher's Classroom AI Pack",
      "Lesson Plan Builder",
    ],
    sections: [
      {
        title: "Classroom planning",
        description: "Lesson plans, activities, and differentiated instruction.",
        filter: {
          type: "keyword",
          terms: ["lesson", "classroom", "quiz", "rubric", "student", "teach"],
        },
      },
      {
        title: "Education bundles",
        description: "Complete packs for educators.",
        filter: { type: "bundle", minPrice: 5 },
        columns: 2,
      },
    ],
  },

  "social-media": {
    slug: "social-media",
    tagline:
      "Social scrubbing suites, caption writers, hashtag tools, and brand safety audits — AI tools for creators and marketing teams.",
    seoTitle: "Social Media AI Tools — Scrubbing, Captions & Growth",
    seoDescription:
      "Social media AI tools: multi-platform scrubbing, caption generators, and brand safety audits. Protect and grow your online presence.",
    featuredTitles: [
      "Social Scrubbing Suite — Facebook, Instagram & LinkedIn",
      "Social Media Growth Bundle",
      "Instagram Caption Writer",
    ],
    sections: [
      {
        title: "Brand safety",
        description: "Audit and clean profiles across every major platform.",
        filter: {
          type: "keyword",
          terms: ["scrub", "audit", "cleanup", "brand", "reputation"],
        },
      },
      {
        title: "Content & growth",
        description: "Captions, hashtags, calendars, and engagement tools.",
        filter: {
          type: "keyword",
          terms: ["caption", "hashtag", "instagram", "growth", "calendar"],
        },
      },
    ],
    crossSellSlug: "marketing",
    crossSellLabel: "More marketing tools",
  },
};

export function getCategoryLandingConfig(
  slug: string,
): CategoryLandingConfig | null {
  return CATEGORY_LANDING[slug] ?? null;
}

export function buildCategoryLandingSections(
  prompts: Prompt[],
  config: CategoryLandingConfig,
  featuredPool?: Prompt[],
) {
  const usedIds = new Set<string>();
  const pool = featuredPool ?? prompts;

  const featured = matchPromptsByTitles(pool, config.featuredTitles);
  featured.forEach((p) => usedIds.add(p.id));

  const sections = config.sections
    .map((section) => {
      const items = filterPromptsBySection(prompts, section.filter, usedIds);
      items.forEach((p) => usedIds.add(p.id));
      return { ...section, prompts: items };
    })
    .filter((s) => s.prompts.length > 0);

  const rest = prompts.filter((p) => !usedIds.has(p.id));

  return { featured, sections, rest };
}
