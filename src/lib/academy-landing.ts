import type { CategoryLandingConfig } from "@/lib/category-landing";
import {
  buildCategoryLandingSections,
  filterPromptsBySection,
  matchPromptsByTitles,
} from "@/lib/category-landing";
import type { Prompt } from "@/types";

export interface AcademyFreeResource {
  title: string;
  description: string;
  href: string;
  badge?: "Free" | "Template";
}

export interface AcademyAudienceConfig extends CategoryLandingConfig {
  name: string;
  emoji: string;
  headline: string;
  categorySlugs: string[];
  gradient: string;
  ring: string;
  freeResources: AcademyFreeResource[];
}

export const ACADEMY_FREE_RESOURCES: AcademyFreeResource[] = [
  {
    title: "AI Basics for Beginners",
    description:
      "What LLMs are, how to talk to them, and when to use AI vs. do it yourself.",
    href: "/explore?price=free",
    badge: "Free",
  },
  {
    title: "Prompt Writing 101",
    description:
      "Role, task, context, format — the four-part framework behind every great prompt.",
    href: "/explore?price=free",
    badge: "Free",
  },
  {
    title: "Free Starter Templates",
    description:
      "Copy-paste templates to try before you buy. No account required to browse.",
    href: "/explore?price=free",
    badge: "Template",
  },
  {
    title: "Free X Checker",
    description:
      "Scan your X timeline for brand-risk tweets — our free tool to build trust.",
    href: "/tools/x-checker",
    badge: "Free",
  },
];

export const ACADEMY_AUDIENCES: Record<string, AcademyAudienceConfig> = {
  students: {
    slug: "students",
    name: "College Students",
    emoji: "🎓",
    headline: "Study smarter, land internships, and ace every presentation.",
    tagline:
      "AI tools for CS, business, marketing, finance, and engineering majors — study assistants, resume builders, internship prep, and research helpers.",
    seoTitle: "AI Academy for College Students — Study, Resume & Internship Tools",
    seoDescription:
      "Learn AI and download outcome-focused tools for college students: study guides, resume builders, internship applications, coding helpers, and presentation prep.",
    categorySlugs: ["education", "writing", "coding", "productivity", "finance"],
    gradient: "from-indigo-500/25 via-blue-500/15 to-cyan-600/25",
    ring: "group-hover:ring-indigo-500/30",
    featuredTitles: [
      "College Essay Coach",
      "Study Guide Generator",
      "Resume Achievement Bullets",
      "Cover Letter Personalizer",
    ],
    sections: [
      {
        title: "Study & exams",
        description:
          "Study guides, essay coaching, and presentation prep that save hours every week.",
        filter: {
          type: "keyword",
          terms: ["study", "essay", "exam", "college", "syllabus", "presentation"],
        },
      },
      {
        title: "Resumes & internships",
        description:
          "ATS-ready resumes, cover letters, and internship application tools.",
        filter: {
          type: "keyword",
          terms: ["resume", "cover letter", "internship", "career", "ats", "linkedin"],
        },
      },
      {
        title: "Coding & engineering",
        description:
          "Debugging helpers, code review, and portfolio project guides for CS majors.",
        filter: {
          type: "keyword",
          terms: ["code", "debug", "sql", "api", "github", "portfolio"],
        },
      },
      {
        title: "Free starters",
        description: "Try AI tools at no cost before upgrading to premium packs.",
        filter: { type: "free" },
      },
      {
        title: "Student bundles",
        description: "Career-specific toolkits and workflow packs.",
        filter: { type: "bundle", minPrice: 5 },
        columns: 2,
      },
    ],
    freeResources: [
      {
        title: "Prompt Writing 101",
        description: "The four-part framework every student should know.",
        href: "/explore?price=free",
        badge: "Free",
      },
      {
        title: "Free Study Templates",
        description: "Starter prompts for notes, outlines, and exam prep.",
        href: "/explore?price=free&category=education",
        badge: "Template",
      },
    ],
  },

  entrepreneurs: {
    slug: "entrepreneurs",
    name: "Aspiring Entrepreneurs",
    emoji: "🚀",
    headline: "Launch faster with business plans, sales tools, and branding AI.",
    tagline:
      "For founders aged 18–30: business plan generators, marketing prompts, sales email tools, logo briefs, and social content systems.",
    seoTitle: "AI Academy for Entrepreneurs — Business Plans, Sales & Branding",
    seoDescription:
      "AI tools for aspiring entrepreneurs: business plan generators, marketing prompts, sales email sequences, branding briefs, and social media content systems.",
    categorySlugs: ["business", "marketing", "sales", "finance", "writing"],
    gradient: "from-emerald-500/25 via-green-500/15 to-teal-600/25",
    ring: "group-hover:ring-emerald-500/30",
    featuredTitles: [
      "Business Model Canvas Coach",
      "Cold Outreach Email Writer",
      "Landing Page Copy Generator",
      "Startup Launch Pack",
    ],
    sections: [
      {
        title: "Business planning",
        description:
          "Business models, OKRs, competitive briefs, and launch checklists.",
        filter: {
          type: "keyword",
          terms: ["business", "startup", "okr", "swot", "canvas", "launch", "strategy"],
        },
      },
      {
        title: "Sales & outreach",
        description:
          "Cold emails, proposals, discovery scripts, and closing talk tracks.",
        filter: {
          type: "keyword",
          terms: ["outreach", "cold", "sales", "proposal", "email", "close"],
        },
      },
      {
        title: "Marketing & branding",
        description:
          "Landing pages, ad copy, brand voice, and social content calendars.",
        filter: {
          type: "keyword",
          terms: ["marketing", "brand", "landing", "ad", "campaign", "logo"],
        },
      },
      {
        title: "Founder bundles",
        description: "Complete workflow packs for solo founders and small teams.",
        filter: { type: "bundle", minPrice: 9 },
        columns: 2,
      },
    ],
    freeResources: [
      {
        title: "AI Basics for Founders",
        description: "When to use AI in your startup — and when not to.",
        href: "/explore?price=free",
        badge: "Free",
      },
      {
        title: "Free Pitch Templates",
        description: "Starter prompts for elevator pitches and one-pagers.",
        href: "/explore?category=business&price=free",
        badge: "Template",
      },
    ],
  },

  creators: {
    slug: "creators",
    name: "Content Creators",
    emoji: "🎬",
    headline: "Publish constantly with scripts, hooks, captions, and thumbnails.",
    tagline:
      "For YouTubers, TikTokers, X creators, newsletter writers, and bloggers — script generators, thumbnail ideas, hook libraries, and caption tools.",
    seoTitle: "AI Academy for Content Creators — Scripts, Hooks & Captions",
    seoDescription:
      "AI tools for content creators: YouTube scripts, TikTok hooks, thumbnail concepts, Instagram captions, newsletter planners, and social growth packs.",
    categorySlugs: ["social-media", "writing", "marketing"],
    gradient: "from-rose-500/25 via-pink-500/15 to-orange-600/25",
    ring: "group-hover:ring-rose-500/30",
    featuredTitles: [
      "YouTube Title & Thumbnail Pack",
      "TikTok Content Batch Planner",
      "Instagram Carousel Planner",
      "Video Script Hook Writer",
    ],
    sections: [
      {
        title: "Scripts & hooks",
        description:
          "Scroll-stopping hooks, short-form scripts, and long-form video outlines.",
        filter: {
          type: "keyword",
          terms: ["script", "hook", "video", "youtube", "tiktok", "reels"],
        },
      },
      {
        title: "Captions & social copy",
        description:
          "Instagram carousels, captions, bios, and platform-specific content.",
        filter: {
          type: "keyword",
          terms: ["caption", "instagram", "carousel", "bio", "hashtag", "social"],
        },
      },
      {
        title: "Newsletters & blogs",
        description:
          "Newsletter editions, blog outlines, and thought leadership posts.",
        filter: {
          type: "keyword",
          terms: ["newsletter", "blog", "linkedin", "post", "content"],
        },
      },
      {
        title: "Creator bundles",
        description: "Multi-tool packs for creators who publish every day.",
        filter: { type: "bundle", minPrice: 9 },
        columns: 2,
      },
    ],
    freeResources: [
      {
        title: "Hook Writing Basics",
        description: "The anatomy of a scroll-stopping first line.",
        href: "/explore?price=free",
        badge: "Free",
      },
      {
        title: "Free Caption Templates",
        description: "Starter prompts for Instagram, X, and LinkedIn.",
        href: "/explore?category=social-media&price=free",
        badge: "Template",
      },
    ],
  },

  freelancers: {
    slug: "freelancers",
    name: "Freelancers",
    emoji: "💼",
    headline: "Complete client work faster — proposals, copy, code, and design briefs.",
    tagline:
      "For copywriters, designers, developers, and virtual assistants — AI tools that help you deliver client work in half the time.",
    seoTitle: "AI Academy for Freelancers — Proposals, Copy & Client Delivery",
    seoDescription:
      "AI tools for freelancers: client proposals, scope documents, copy rewrites, code review, design briefs, and invoice collection — ship faster, earn more.",
    categorySlugs: ["business", "writing", "coding", "sales"],
    gradient: "from-violet-500/25 via-purple-500/15 to-fuchsia-600/25",
    ring: "group-hover:ring-violet-500/30",
    featuredTitles: [
      "Freelancer Essentials Bundle",
      "Client Proposal Generator",
      "Resume Achievement Bullets",
      "Cold Outreach Email Writer",
    ],
    sections: [
      {
        title: "Client proposals & scope",
        description:
          "Win more projects with polished proposals, SOWs, and pricing narratives.",
        filter: {
          type: "keyword",
          terms: ["proposal", "client", "freelance", "scope", "contract", "invoice"],
        },
      },
      {
        title: "Copy & content delivery",
        description:
          "Rewrites, blog drafts, email copy, and UX microcopy for client projects.",
        filter: {
          type: "keyword",
          terms: ["copy", "rewrite", "blog", "email", "content", "microcopy"],
        },
      },
      {
        title: "Developer freelancers",
        description:
          "Code review, PR summaries, API docs, and debugging assistants.",
        filter: {
          type: "keyword",
          terms: ["code", "pr", "api", "debug", "sql", "docs"],
        },
      },
      {
        title: "Freelancer bundles",
        description: "All-in-one packs for independent professionals.",
        filter: { type: "bundle", minPrice: 9 },
        columns: 2,
      },
    ],
    freeResources: [
      {
        title: "Client Communication Templates",
        description: "Professional email prompts for scope, revisions, and follow-ups.",
        href: "/explore?category=business&price=free",
        badge: "Template",
      },
      {
        title: "Free Proposal Starters",
        description: "Outline prompts to win your next freelance gig.",
        href: "/explore?price=free",
        badge: "Free",
      },
    ],
  },

  learners: {
    slug: "learners",
    name: "AI Learners",
    emoji: "🧠",
    headline: "Learn AI from scratch — then level up with workflows and automation.",
    tagline:
      "For high school and college students learning AI: start with free basics, graduate to prompt packs, workflows, and career-specific toolkits.",
    seoTitle: "AI Academy — Learn AI, Prompt Writing & Automation",
    seoDescription:
      "Free AI basics and prompt writing lessons. Premium prompt packs, workflows, and automation kits for students building portfolios and side hustles.",
    categorySlugs: ["productivity", "education", "writing", "coding"],
    gradient: "from-cyan-500/25 via-sky-500/15 to-blue-600/25",
    ring: "group-hover:ring-cyan-500/30",
    featuredTitles: [
      "Welcome Pack - 10 Free AI Prompts",
      "Complete AI Starter Mega Pack",
      "Productivity Power Pack",
      "Study Guide Generator",
    ],
    sections: [
      {
        title: "Free — start here",
        description:
          "AI basics, prompt templates, and beginner workflows at no cost.",
        filter: { type: "free" },
      },
      {
        title: "Prompt packs & workflows",
        description:
          "Curated packs that teach prompt patterns through real use cases.",
        filter: {
          type: "keyword",
          terms: ["pack", "starter", "workflow", "mega", "welcome"],
        },
      },
      {
        title: "Build a portfolio",
        description:
          "Tools to create projects, write case studies, and stand out to employers.",
        filter: {
          type: "keyword",
          terms: ["portfolio", "project", "resume", "case study", "github"],
        },
      },
      {
        title: "Side hustle starters",
        description:
          "Launch a small business or freelance offer with AI-assisted workflows.",
        filter: {
          type: "keyword",
          terms: ["freelance", "side", "business", "launch", "income"],
        },
      },
      {
        title: "Premium automation kits",
        description: "Advanced multi-tool packs for power users.",
        filter: { type: "bundle", minPrice: 5 },
        columns: 2,
      },
    ],
    freeResources: ACADEMY_FREE_RESOURCES,
  },
};

export const ACADEMY_AUDIENCE_SLUGS = Object.keys(ACADEMY_AUDIENCES);

export function getAcademyAudienceConfig(
  slug: string,
): AcademyAudienceConfig | null {
  return ACADEMY_AUDIENCES[slug] ?? null;
}

export function dedupePrompts(prompts: Prompt[]): Prompt[] {
  const seen = new Set<string>();
  return prompts.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export function buildAcademyLandingSections(
  prompts: Prompt[],
  config: AcademyAudienceConfig,
) {
  return buildCategoryLandingSections(prompts, config);
}

export { filterPromptsBySection, matchPromptsByTitles };
