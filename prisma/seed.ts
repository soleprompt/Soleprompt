import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL?.replace("-pooler", "");
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  {
    slug: "marketing",
    name: "Marketing",
    description: "Ads, campaigns, and growth strategies",
    icon: "Megaphone",
  },
  {
    slug: "seo",
    name: "SEO",
    description: "Search optimization, rankings, and organic traffic",
    icon: "Search",
  },
  {
    slug: "development",
    name: "Development",
    description: "Code, debugging, and architecture",
    icon: "Code2",
  },
  {
    slug: "business",
    name: "Business",
    description: "Strategy, ops, and productivity",
    icon: "Briefcase",
  },
  {
    slug: "writing",
    name: "Writing",
    description: "Copy, blogs, and storytelling",
    icon: "PenLine",
  },
] as const;

const SELLERS = [
  { clerkUserId: "seed_seller_sarah", username: "sarahchen", email: "sarah@soleprompt.dev", displayName: "Sarah Chen" },
  { clerkUserId: "seed_seller_marcus", username: "marcuswebb", email: "marcus@soleprompt.dev", displayName: "Marcus Webb" },
  { clerkUserId: "seed_seller_elena", username: "elenarod", email: "elena@soleprompt.dev", displayName: "Elena Rodriguez" },
  { clerkUserId: "seed_seller_james", username: "jamespark", email: "james@soleprompt.dev", displayName: "James Park" },
  { clerkUserId: "seed_seller_alex", username: "alexkim", email: "alex@soleprompt.dev", displayName: "Alex Kim" },
] as const;

const BUYERS = [
  { clerkUserId: "seed_buyer_1", username: "alex_m", email: "alex.m@example.com" },
  { clerkUserId: "seed_buyer_2", username: "jordan_k", email: "jordan.k@example.com" },
  { clerkUserId: "seed_buyer_3", username: "sam_t", email: "sam.t@example.com" },
  { clerkUserId: "seed_buyer_4", username: "riley_p", email: "riley.p@example.com" },
  { clerkUserId: "seed_buyer_5", username: "casey_w", email: "casey.w@example.com" },
  { clerkUserId: "seed_buyer_6", username: "taylor_n", email: "taylor.n@example.com" },
  { clerkUserId: "seed_buyer_7", username: "morgan_l", email: "morgan.l@example.com" },
  { clerkUserId: "seed_buyer_8", username: "drew_h", email: "drew.h@example.com" },
] as const;

type CategorySlug = (typeof CATEGORIES)[number]["slug"];

type PromptDefinition = {
  title: string;
  categorySlug: CategorySlug;
  tags: string[];
  price: number;
  exactPrice?: boolean;
  description: string;
  content: string;
  preview: string;
  compatibleModels: string[];
  sampleOutput: string;
};

const COMPATIBLE_MODELS = [
  "GPT-4o",
  "GPT-4",
  "Claude 3.5 Sonnet",
  "Claude 3 Opus",
  "Gemini 2.0",
  "Llama 3.1",
  "Mistral Large",
] as const;

function pickCompatibleModels(title: string): string[] {
  const hash = title.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const start = hash % (COMPATIBLE_MODELS.length - 2);
  return COMPATIBLE_MODELS.slice(start, start + 3);
}

function buildSampleOutput(title: string, deliverable: string): string {
  return `# ${title} — Sample Output

## Summary
${deliverable} tailored to your product, audience, and goals.

## Deliverables
1. Primary strategy with step-by-step implementation
2. Alternative approaches for testing and optimization
3. Ready-to-use copy and assets

## Example Section
Based on your inputs, here are prioritized recommendations with clear rationale and next actions you can deploy immediately.

---
*Actual output adapts to your specific context and constraints.*`;
}

function prompt(
  title: string,
  categorySlug: CategorySlug,
  tags: string[],
  price: number,
  role: string,
  deliverable: string,
  exactPrice = false,
): PromptDefinition {
  const description = `${deliverable} with structured outputs, best-practice frameworks, and ready-to-use templates.`;
  const content = `You are a ${role}. The user will provide their product, audience, goals, and constraints. ${deliverable}. Return clear sections, actionable recommendations, and copy-ready assets the user can deploy immediately.`;

  return {
    title,
    categorySlug,
    tags,
    price,
    exactPrice,
    description,
    content,
    preview: `${content.slice(0, 180)}${content.length > 180 ? "…" : ""}`,
    compatibleModels: pickCompatibleModels(title),
    sampleOutput: buildSampleOutput(title, deliverable),
  };
}

const MARKETPLACE_PROMPTS: PromptDefinition[] = [
  // Marketing (1–20)
  prompt("Facebook Ads Master Prompt", "marketing", ["Facebook", "Paid Ads", "Conversion"], 24.99, "senior performance marketer", "Build complete Facebook ad campaigns with audience targeting, creative angles, primary text, headlines, and CTA variants"),
  prompt("Google Ads Campaign Builder", "marketing", ["Google Ads", "PPC", "Search"], 27.99, "Google Ads specialist", "Design search and display campaigns with keyword groups, ad copy, extensions, and budget allocation"),
  prompt("TikTok Ad Generator", "marketing", ["TikTok", "Video Ads", "UGC"], 19.99, "TikTok growth marketer", "Create scroll-stopping TikTok ad scripts, hooks, and creative briefs optimized for short-form video"),
  prompt("Instagram Carousel Creator", "marketing", ["Instagram", "Carousel", "Social"], 16.99, "Instagram content strategist", "Write multi-slide carousel copy with hook slides, educational beats, and a strong closing CTA"),
  prompt("Viral X Thread Writer", "marketing", ["X", "Threads", "Social"], 14.99, "social media copywriter", "Draft viral X threads with a compelling hook, numbered insights, and engagement-driving close"),
  prompt("LinkedIn Authority Posts", "marketing", ["LinkedIn", "B2B", "Thought Leadership"], 18.99, "LinkedIn ghostwriter", "Produce authority-building LinkedIn posts with story hooks, lessons, and professional CTAs"),
  prompt("Email Marketing Campaign Generator", "marketing", ["Email", "Campaigns", "Automation"], 22.99, "email marketing strategist", "Generate full email campaigns including welcome, nurture, promo, and re-engagement sequences"),
  prompt("Landing Page Copywriter", "marketing", ["Landing Page", "Conversion", "Copy"], 21.99, "conversion copywriter", "Write hero, benefits, social proof, FAQ, and CTA sections for high-converting landing pages"),
  prompt("Product Launch Marketing Plan", "marketing", ["Launch", "Go-to-Market", "Strategy"], 34.99, "product launch marketer", "Create a multi-channel launch plan with timelines, messaging pillars, and channel tactics"),
  prompt("Black Friday Campaign Builder", "marketing", ["Black Friday", "Promotions", "E-commerce"], 26.99, "e-commerce campaign manager", "Build Black Friday offer stacks, email flows, ad angles, and urgency-driven copy"),
  prompt("Holiday Marketing Planner", "marketing", ["Holiday", "Seasonal", "Campaigns"], 23.99, "seasonal marketing planner", "Plan holiday campaigns across email, social, and paid with themed messaging calendars"),
  prompt("Marketing Funnel Generator", "marketing", ["Funnel", "TOFU", "MOFU"], 29.99, "funnel strategist", "Map awareness-to-conversion funnels with stage-specific content, offers, and KPIs"),
  prompt("Customer Avatar Builder", "marketing", ["Persona", "ICP", "Research"], 17.99, "market researcher", "Build detailed customer avatars with demographics, pain points, goals, and buying triggers"),
  prompt("Marketing SWOT Analysis", "marketing", ["SWOT", "Strategy", "Analysis"], 15.99, "marketing strategist", "Run a marketing SWOT with strengths, weaknesses, opportunities, threats, and action priorities"),
  prompt("Viral Hook Generator", "marketing", ["Hooks", "Viral", "Content"], 12.99, "content hook specialist", "Generate dozens of scroll-stopping hooks for ads, reels, and social posts"),
  prompt("Ad Headline Generator", "marketing", ["Headlines", "Ads", "A/B Testing"], 11.99, "direct response copywriter", "Produce high-converting ad headline variants for search, social, and display"),
  prompt("YouTube Thumbnail Title Generator", "marketing", ["YouTube", "Titles", "CTR"], 13.99, "YouTube growth strategist", "Create click-worthy thumbnail title pairs optimized for CTR and search"),
  prompt("Conversion Rate Optimization Advisor", "marketing", ["CRO", "Testing", "UX"], 31.99, "CRO consultant", "Audit pages and recommend CRO experiments with hypotheses, variants, and success metrics"),
  prompt("Sales Funnel Copy Generator", "marketing", ["Sales Funnel", "Copy", "Conversion"], 25.99, "sales funnel copywriter", "Write funnel copy for opt-in, tripwire, core offer, upsell, and thank-you pages"),
  prompt("Local Business Marketing Planner", "marketing", ["Local", "SMB", "Growth"], 20.99, "local marketing consultant", "Create local marketing plans with GBP, reviews, geo-targeted ads, and community tactics"),

  // SEO (21–40)
  prompt("Complete SEO Blog Writer", "seo", ["Blog", "Content", "SEO"], 26.99, "SEO content writer", "Write full SEO blog posts with optimized headings, internal links, and meta suggestions"),
  prompt("Keyword Research Assistant", "seo", ["Keywords", "Research", "Intent"], 22.99, "SEO researcher", "Generate keyword lists grouped by intent, difficulty, and content opportunity"),
  prompt("SEO Content Cluster Generator", "seo", ["Clusters", "Pillar Pages", "Topical Authority"], 28.99, "SEO strategist", "Build topical content clusters with pillar pages and supporting article outlines"),
  prompt("Meta Title Generator", "seo", ["Meta Title", "SERP", "On-Page"], 11.99, "SEO copywriter", "Generate optimized title tags within character limits for target keywords"),
  prompt("Meta Description Generator", "seo", ["Meta Description", "SERP", "CTR"], 10.99, "SEO copywriter", "Write compelling meta descriptions that improve CTR while matching search intent"),
  prompt("Internal Linking Planner", "seo", ["Internal Links", "Site Architecture", "On-Page"], 19.99, "technical SEO specialist", "Plan internal linking maps with anchor text, hub pages, and orphan page fixes"),
  prompt("Technical SEO Auditor", "seo", ["Technical SEO", "Audit", "Crawl"], 34.99, "technical SEO consultant", "Audit crawlability, indexation, Core Web Vitals, and schema with prioritized fixes"),
  prompt("Local SEO Optimizer", "seo", ["Local SEO", "GBP", "Maps"], 21.99, "local SEO expert", "Optimize local rankings with GBP, citations, local pages, and review strategies"),
  prompt("Backlink Outreach Writer", "seo", ["Link Building", "Outreach", "Backlinks"], 24.99, "link building specialist", "Write personalized backlink outreach emails and content pitch angles"),
  prompt("Competitor SEO Analyzer", "seo", ["Competitor", "Gap Analysis", "Research"], 27.99, "SEO analyst", "Analyze competitor keywords, content gaps, and backlink opportunities"),
  prompt("FAQ Schema Generator", "seo", ["FAQ Schema", "Structured Data", "Rich Results"], 16.99, "SEO schema specialist", "Generate FAQ content and JSON-LD schema markup for rich results"),
  prompt("Featured Snippet Optimizer", "seo", ["Featured Snippets", "SERP", "Formatting"], 20.99, "SERP optimization expert", "Rewrite content blocks to target featured snippets and People Also Ask"),
  prompt("Ecommerce SEO Optimizer", "seo", ["E-commerce", "Product SEO", "Category Pages"], 29.99, "e-commerce SEO consultant", "Optimize product, category, and faceted navigation pages for organic search"),
  prompt("SEO Content Calendar", "seo", ["Content Calendar", "Planning", "Publishing"], 18.99, "SEO content planner", "Build a 90-day SEO content calendar with topics, keywords, and publish dates"),
  prompt("Search Intent Analyzer", "seo", ["Search Intent", "SERP Analysis", "Keywords"], 17.99, "search intent analyst", "Classify keywords by intent and recommend content formats for each cluster"),
  prompt("Long-Tail Keyword Finder", "seo", ["Long-Tail", "Keywords", "Low Competition"], 15.99, "keyword researcher", "Discover long-tail keyword opportunities with content angle suggestions"),
  prompt("Programmatic SEO Planner", "seo", ["Programmatic SEO", "Templates", "Scale"], 32.99, "programmatic SEO architect", "Design programmatic page templates, data sources, and indexation rules"),
  prompt("Content Refresh Optimizer", "seo", ["Content Refresh", "Updates", "Rankings"], 23.99, "SEO editor", "Audit declining pages and recommend refresh updates to recover rankings"),
  prompt("YouTube SEO Assistant", "seo", ["YouTube", "Video SEO", "Discovery"], 19.99, "YouTube SEO specialist", "Optimize titles, descriptions, tags, chapters, and playlists for video discovery"),
  prompt("Pinterest SEO Writer", "seo", ["Pinterest", "Visual Search", "Pins"], 14.99, "Pinterest SEO strategist", "Write pin titles, descriptions, and board strategies for Pinterest search traffic"),

  // Programming → Development (41–60)
  prompt("Full Stack React Architect", "development", ["React", "Full Stack", "Architecture"], 39.99, "senior full-stack architect", "Design and scaffold production-ready React applications with routing, state, API layer, and deployment plan"),
  prompt("Next.js SaaS Generator", "development", ["Next.js", "SaaS", "TypeScript"], 44.99, "Next.js SaaS engineer", "Generate Next.js SaaS scaffolds with auth, billing hooks, dashboard routes, and database schema"),
  prompt("Python Automation Builder", "development", ["Python", "Automation", "Scripts"], 24.99, "Python automation engineer", "Build Python scripts for data processing, API integration, and workflow automation"),
  prompt("SQL Query Generator", "development", ["SQL", "Queries", "Database"], 18.99, "database engineer", "Write optimized SQL queries, joins, aggregations, and explain execution considerations"),
  prompt("API Documentation Writer", "development", ["API", "Documentation", "OpenAPI"], 27.99, "technical writer", "Generate developer-friendly API docs with endpoints, examples, errors, and auth guides"),
  prompt("Debugging Assistant", "development", ["Debugging", "Troubleshooting", "Errors"], 21.99, "senior software debugger", "Diagnose bugs from stack traces and code snippets with root cause analysis and fixes"),
  prompt("JavaScript Performance Optimizer", "development", ["JavaScript", "Performance", "Optimization"], 26.99, "frontend performance engineer", "Profile and optimize JavaScript for bundle size, runtime speed, and rendering efficiency"),
  prompt("CSS Animation Generator", "development", ["CSS", "Animation", "UI"], 16.99, "UI motion designer", "Create CSS animations and keyframe transitions with accessible fallbacks"),
  prompt("Mobile App Architecture Planner", "development", ["Mobile", "Architecture", "React Native"], 33.99, "mobile architect", "Plan mobile app architecture with navigation, state, offline strategy, and API design"),
  prompt("AI Chatbot Builder", "development", ["AI", "Chatbot", "LLM"], 36.99, "AI application engineer", "Design chatbot flows, system prompts, tool use, and guardrails for production assistants"),
  prompt("Chrome Extension Generator", "development", ["Chrome Extension", "JavaScript", "Manifest"], 22.99, "browser extension developer", "Scaffold Chrome extensions with manifest, background scripts, and popup UI"),
  prompt("GitHub README Creator", "development", ["README", "GitHub", "Documentation"], 12.99, "open source maintainer", "Write polished README files with setup, usage, contributing, and badge sections"),
  prompt("Code Review Assistant", "development", ["Code Review", "Quality", "Security"], 19.99, "staff engineer", "Review code for bugs, security issues, performance problems, and style improvements"),
  prompt("Unit Test Generator", "development", ["Testing", "Unit Tests", "TDD"], 18.99, "test engineer", "Write comprehensive unit tests with edge cases, mocks, and clear assertions"),
  prompt("DevOps Deployment Guide", "development", ["DevOps", "Deployment", "CI/CD"], 28.99, "DevOps engineer", "Create deployment guides with CI/CD pipelines, environments, and rollback procedures"),
  prompt("Docker Assistant", "development", ["Docker", "Containers", "DevOps"], 23.99, "containerization specialist", "Write Dockerfiles, compose stacks, and container best practices for the target app"),
  prompt("Prisma Database Designer", "development", ["Prisma", "Database", "Schema"], 29.99, "database architect", "Design Prisma schemas with models, relations, indexes, and migration notes"),
  prompt("Authentication Setup Assistant", "development", ["Auth", "Security", "OAuth"], 31.99, "security-focused backend engineer", "Implement authentication flows with session/JWT/OAuth patterns and security checklist"),
  prompt("API Error Troubleshooter", "development", ["API", "Errors", "Debugging"], 20.99, "backend engineer", "Troubleshoot API errors with status codes, payload validation, and fix recommendations"),
  prompt("Refactoring Expert", "development", ["Refactoring", "Clean Code", "Legacy"], 27.99, "software refactoring specialist", "Produce phased refactoring plans with risk assessment and test coverage goals"),

  // Business (61–80)
  prompt("Business Plan Generator", "business", ["Business Plan", "Startup", "Strategy"], 42.99, "business plan consultant", "Generate complete business plans with market analysis, financials, and go-to-market strategy"),
  prompt("Startup Pitch Deck Creator", "business", ["Pitch Deck", "Startup", "Fundraising"], 49.99, "startup advisor", "Create investor pitch deck slide content with speaker notes and narrative flow"),
  prompt("Executive Summary Writer", "business", ["Executive Summary", "Reports", "Leadership"], 24.99, "executive communications writer", "Write concise executive summaries for proposals, reports, and board updates"),
  prompt("Investor Pitch Coach", "business", ["Investor", "Pitch", "Fundraising"], 38.99, "venture pitch coach", "Coach founder pitches with storyline, objection handling, and Q&A preparation"),
  prompt("Pricing Strategy Planner", "business", ["Pricing", "Strategy", "Revenue"], 29.99, "pricing strategist", "Design pricing tiers, packaging, and value metrics aligned to customer segments"),
  prompt("Business Model Canvas Builder", "business", ["Business Model", "Canvas", "Startup"], 22.99, "business strategist", "Complete a Business Model Canvas with channels, revenue streams, and key metrics"),
  prompt("Competitive Analysis Assistant", "business", ["Competitive Analysis", "Market", "Strategy"], 26.99, "competitive intelligence analyst", "Compare competitors on features, pricing, positioning, and strategic recommendations"),
  prompt("Sales Script Generator", "business", ["Sales", "Scripts", "Closing"], 21.99, "sales enablement lead", "Write sales call scripts with discovery questions, objection handlers, and closes"),
  prompt("Cold Outreach Email Writer", "business", ["Cold Email", "Outreach", "B2B"], 17.99, "B2B outreach specialist", "Draft personalized cold outreach sequences with follow-ups and CTAs"),
  prompt("Proposal Generator", "business", ["Proposals", "Clients", "Sales"], 27.99, "proposal writer", "Generate client proposals with scope, timeline, deliverables, and pricing sections"),
  prompt("Client Onboarding Kit", "business", ["Onboarding", "Clients", "Operations"], 23.99, "client success manager", "Build onboarding kits with welcome emails, checklists, and kickoff agendas"),
  prompt("Meeting Agenda Creator", "business", ["Meetings", "Agenda", "Productivity"], 9.99, "executive assistant", "Create structured meeting agendas with objectives, topics, and action item templates"),
  prompt("SOP Generator", "business", ["SOP", "Process", "Operations"], 19.99, "operations consultant", "Write standard operating procedures with steps, owners, and quality checkpoints"),
  prompt("Hiring Interview Questions", "business", ["Hiring", "Interviews", "HR"], 16.99, "talent acquisition lead", "Generate role-specific interview questions with scoring rubrics"),
  prompt("Performance Review Writer", "business", ["Performance Review", "HR", "Feedback"], 18.99, "HR business partner", "Draft balanced performance reviews with strengths, growth areas, and goals"),
  prompt("Business KPI Dashboard Planner", "business", ["KPIs", "Dashboard", "Analytics"], 25.99, "business analyst", "Define KPI dashboards with metrics, targets, data sources, and reporting cadence"),
  prompt("SWOT Generator", "business", ["SWOT", "Strategy", "Planning"], 14.99, "strategy consultant", "Produce SWOT analyses with actionable recommendations for each quadrant"),
  prompt("Profit Margin Optimizer", "business", ["Profit Margin", "Finance", "Pricing"], 28.99, "financial analyst", "Analyze margins and recommend cost, pricing, and mix improvements"),
  prompt("Strategic Planning Assistant", "business", ["Strategy", "Planning", "Roadmap"], 32.99, "strategy facilitator", "Build strategic plans with vision, priorities, initiatives, and quarterly milestones"),
  prompt("Customer Retention Planner", "business", ["Retention", "Churn", "Customer Success"], 24.99, "customer retention strategist", "Design retention programs with lifecycle triggers, offers, and success metrics"),

  // Content & Writing → Writing (81–100)
  prompt("Book Outline Creator", "writing", ["Books", "Outline", "Publishing"], 29.99, "book development editor", "Create detailed book outlines with chapter summaries, arcs, and reader takeaways"),
  prompt("Fiction Story Generator", "writing", ["Fiction", "Story", "Creative"], 22.99, "fiction writing coach", "Generate fiction story premises, character arcs, and scene beats in the chosen genre"),
  prompt("YouTube Script Writer", "writing", ["YouTube", "Script", "Video"], 19.99, "YouTube scriptwriter", "Write video scripts with hooks, retention beats, B-roll cues, and CTAs"),
  prompt("Podcast Episode Planner", "writing", ["Podcast", "Episodes", "Audio"], 18.99, "podcast producer", "Plan podcast episodes with segment outlines, guest questions, and show notes"),
  prompt("Newsletter Writer", "writing", ["Newsletter", "Email", "Content"], 16.99, "newsletter editor", "Write engaging newsletter editions with intro hooks, curated sections, and CTAs"),
  prompt("Blog Outline Generator", "writing", ["Blog", "Outline", "Content"], 12.99, "content strategist", "Create SEO-friendly blog outlines with H2/H3 structure and keyword placement"),
  prompt("Viral Reel Script Generator", "writing", ["Reels", "Short Form", "Social"], 15.99, "short-form scriptwriter", "Write viral reel scripts with pattern interrupts, pacing, and on-screen text cues"),
  prompt("AI Image Prompt Generator", "writing", ["AI Art", "Midjourney", "Prompts"], 13.99, "AI art prompt engineer", "Generate detailed image prompts with style, composition, lighting, and negative prompts"),
  prompt("Resume Writer", "writing", ["Resume", "Career", "Job Search"], 21.99, "professional resume writer", "Write ATS-optimized resumes with achievement bullets and role-tailored summaries"),
  prompt("Cover Letter Generator", "writing", ["Cover Letter", "Career", "Applications"], 14.99, "career coach", "Draft tailored cover letters connecting candidate strengths to role requirements"),
  prompt("Professional Bio Creator", "writing", ["Bio", "Personal Brand", "LinkedIn"], 11.99, "personal branding writer", "Write professional bios for websites, speaker pages, and social profiles"),
  prompt("Speech Writer", "writing", ["Speech", "Public Speaking", "Events"], 26.99, "speechwriter", "Craft speeches with opening hooks, narrative structure, and memorable closings"),
  prompt("Press Release Generator", "writing", ["Press Release", "PR", "Media"], 23.99, "PR writer", "Draft newsworthy press releases with quotes, boilerplate, and AP-style formatting"),
  prompt("Brand Voice Creator", "writing", ["Brand Voice", "Tone", "Guidelines"], 24.99, "brand voice strategist", "Define brand voice guidelines with tone pillars, do/don't examples, and sample copy"),
  prompt("Ebook Generator", "writing", ["Ebook", "Lead Magnet", "Publishing"], 31.99, "ebook author", "Outline and draft ebook chapters with lead magnet positioning and CTAs"),
  prompt("Course Outline Builder", "writing", ["Courses", "Curriculum", "Education"], 28.99, "instructional designer", "Build course outlines with modules, lessons, assessments, and learning outcomes"),
  prompt("FAQ Creator", "writing", ["FAQ", "Support", "Documentation"], 10.99, "technical content writer", "Generate comprehensive FAQ pages organized by topic with clear answers"),
  prompt("Customer Support Response Writer", "writing", ["Support", "Customer Service", "Templates"], 15.99, "customer support lead", "Write empathetic support response templates for common issues and escalations"),
  prompt("Review Response Assistant", "writing", ["Reviews", "Reputation", "Support"], 12.99, "reputation manager", "Draft on-brand responses to customer reviews across positive and negative scenarios"),
  prompt("AI Prompt Engineer Pro", "writing", ["Prompt Engineering", "LLM", "AI"], 34.99, "senior prompt engineer", "Design advanced LLM prompts with system instructions, examples, constraints, and evaluation criteria"),

  // Budget marketplace prompts (101–120)
  prompt("Professional Email Rewriter", "writing", ["Email", "Professional", "Communication"], 1.99, "professional communications editor", "Rewrite emails for clarity, tone, and impact while preserving intent and key details", true),
  prompt("AI Instagram Caption Generator", "marketing", ["Instagram", "Captions", "Social Media"], 1.99, "Instagram copywriter", "Generate engaging Instagram captions with hooks, body copy, CTAs, and hashtag suggestions", true),
  prompt("LinkedIn Headline Generator", "marketing", ["LinkedIn", "Headline", "Personal Brand"], 1.99, "LinkedIn profile strategist", "Create compelling LinkedIn headlines that showcase expertise and attract the right opportunities", true),
  prompt("Resume Bullet Improver", "writing", ["Resume", "Career", "ATS"], 1.99, "resume coach", "Transform weak resume bullets into achievement-driven statements with metrics and impact", true),
  prompt("Cover Letter Generator", "writing", ["Cover Letter", "Job Search", "Applications"], 1.99, "career coach", "Draft tailored cover letters that connect your experience to the role and company", true),
  prompt("YouTube Video Title Generator", "marketing", ["YouTube", "Titles", "CTR"], 1.99, "YouTube growth strategist", "Generate click-worthy YouTube video titles optimized for search and CTR", true),
  prompt("TikTok Hook Generator", "marketing", ["TikTok", "Hooks", "Short Form"], 1.99, "TikTok content strategist", "Create scroll-stopping TikTok hooks that capture attention in the first three seconds", true),
  prompt("AI Hashtag Generator", "marketing", ["Hashtags", "Social Media", "Discovery"], 1.99, "social media strategist", "Generate relevant hashtag sets grouped by reach, niche, and platform best practices", true),
  prompt("Product Description Writer", "marketing", ["E-commerce", "Product Copy", "Sales"], 1.99, "e-commerce copywriter", "Write persuasive product descriptions with benefits, features, and conversion-focused copy", true),
  prompt("Customer Apology Email Writer", "writing", ["Customer Service", "Apology", "Email"], 1.99, "customer experience specialist", "Draft sincere, professional apology emails that acknowledge issues and rebuild trust", true),
  prompt("Cold Email Icebreaker Generator", "business", ["Cold Email", "Outreach", "B2B"], 2.99, "B2B outreach specialist", "Generate personalized cold email icebreakers based on prospect research and context", true),
  prompt("Business Name Generator", "business", ["Branding", "Naming", "Startup"], 2.99, "brand naming consultant", "Brainstorm memorable business names with taglines, domain ideas, and naming rationale", true),
  prompt("Startup Idea Generator", "business", ["Startup", "Ideas", "Innovation"], 2.99, "startup advisor", "Generate validated startup ideas with problem statements, target markets, and MVP concepts", true),
  prompt("AI Meeting Summary Prompt", "business", ["Meetings", "Summary", "Productivity"], 2.99, "executive assistant", "Summarize meeting notes into decisions, action items, owners, and follow-up deadlines", true),
  prompt("Daily Meal Planner", "business", ["Meal Planning", "Nutrition", "Health"], 2.99, "nutrition planner", "Create balanced daily meal plans with recipes, macros, and grocery lists for your goals", true),
  prompt("Workout Plan Generator", "business", ["Fitness", "Workout", "Health"], 2.99, "fitness coach", "Build customized workout plans with exercises, sets, reps, and progressive overload schedules", true),
  prompt("Budget Planner Prompt", "business", ["Budget", "Finance", "Personal Finance"], 2.99, "personal finance advisor", "Create monthly budgets with income allocation, savings targets, and spending categories", true),
  prompt("Travel Itinerary Generator", "writing", ["Travel", "Itinerary", "Planning"], 2.99, "travel planner", "Build day-by-day travel itineraries with activities, timing, logistics, and local tips", true),
  prompt("Interview Question Practice", "business", ["Interview", "Career", "Preparation"], 2.99, "interview coach", "Generate role-specific interview questions with model answers and feedback frameworks", true),
  prompt("Blog Outline Generator", "writing", ["Blog", "Outline", "Content"], 2.99, "content strategist", "Create structured blog outlines with H2/H3 headings, key points, and SEO keyword placement", true),
];

type PromptSeed = {
  title: string;
  description: string;
  content: string;
  preview: string;
  compatibleModels: string[];
  sampleOutput: string;
  categorySlug: CategorySlug;
  price: number;
  featured: boolean;
  tags: string[];
  sellerIndex: number;
  views: number;
  salesCount: number;
  ratings: number[];
};

function buildMarketplacePrompts(): PromptSeed[] {
  const ratingPool = [5, 5, 4, 5, 4, 4, 5, 3, 5, 4];

  return MARKETPLACE_PROMPTS.map((definition, index) => {
    const sellerIndex = index % SELLERS.length;
    const priceOffset = (index % 5) * 0.5;
    const views = 220 + index * 37;
    const salesCount = 4 + (index * 7) % 48;
    const ratings = [
      ratingPool[index % ratingPool.length],
      ratingPool[(index + 2) % ratingPool.length],
      ratingPool[(index + 5) % ratingPool.length],
    ];

    return {
      title: definition.title,
      description: definition.description,
      content: definition.content,
      preview: definition.preview,
      compatibleModels: definition.compatibleModels,
      sampleOutput: definition.sampleOutput,
      categorySlug: definition.categorySlug,
      price: definition.exactPrice
        ? definition.price
        : Math.round((definition.price + priceOffset) * 100) / 100,
      featured: index < 4,
      tags: definition.tags,
      sellerIndex,
      views,
      salesCount,
      ratings,
    };
  });
}

const PROMPTS = buildMarketplacePrompts();

const REVIEW_COMMENTS = [
  "Exactly what I needed. Saved hours of work.",
  "High quality prompt, works great with GPT-4.",
  "Clear instructions and excellent results every time.",
  "Worth every penny. Highly recommend.",
  "Great value for the price.",
  null,
  "Solid prompt, minor tweaks needed for my use case.",
  "Perfect for my workflow.",
];

async function clearDatabase() {
  await prisma.$transaction([
    prisma.promptView.deleteMany(),
    prisma.wishlist.deleteMany(),
    prisma.review.deleteMany(),
    prisma.purchase.deleteMany(),
    prisma.promptTag.deleteMany(),
    prisma.prompt.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.sellerProfile.deleteMany(),
    prisma.user.deleteMany(),
    prisma.category.deleteMany(),
  ]);
}

async function withSeedLock<T>(fn: () => Promise<T>): Promise<T> {
  await prisma.$executeRaw`SELECT pg_advisory_lock(hashtext('soleprompt-seed'))`;
  try {
    return await fn();
  } finally {
    await prisma.$executeRaw`SELECT pg_advisory_unlock(hashtext('soleprompt-seed'))`;
  }
}

async function main() {
  await withSeedLock(async () => {
    console.log("Seeding marketplace database...");

  await clearDatabase();

  const categories = [];
  for (const cat of CATEGORIES) {
    categories.push(await prisma.category.create({ data: cat }));
  }
  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const sellerUsers = [];
  for (const seller of SELLERS) {
    sellerUsers.push(
      await prisma.user.create({
        data: {
          clerkUserId: seller.clerkUserId,
          username: seller.username,
          email: seller.email,
          role: "seller",
          sellerProfile: {
            create: {
              displayName: seller.displayName,
              bio: `Premium prompt creator specializing in ${seller.displayName.split(" ")[0]}'s domain.`,
            },
          },
        },
      }),
    );
  }

  const buyerUsers = [];
  for (const buyer of BUYERS) {
    buyerUsers.push(
      await prisma.user.create({
        data: {
          clerkUserId: buyer.clerkUserId,
          username: buyer.username,
          email: buyer.email,
          role: "buyer",
        },
      }),
    );
  }

  const tagIds = new Map<string, string>();

  async function getOrCreateTagId(name: string) {
    const cached = tagIds.get(name);
    if (cached) return cached;

    const tag = await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    tagIds.set(name, tag.id);
    return tag.id;
  }

  const createdPrompts: Array<{ id: string; price: number; seed: PromptSeed }> = [];

  for (const promptData of PROMPTS) {
    const seller = sellerUsers[promptData.sellerIndex];
    const category = categoryBySlug[promptData.categorySlug];

    if (!seller || !category) {
      throw new Error(
        `Missing seed relation for "${promptData.title}" (seller=${Boolean(seller)}, category=${promptData.categorySlug})`,
      );
    }

    const promptRecord = await prisma.prompt.create({
      data: {
        title: promptData.title,
        description: promptData.description,
        content: promptData.content,
        preview: promptData.preview,
        compatibleModels: promptData.compatibleModels,
        sampleOutput: promptData.sampleOutput,
        price: promptData.price,
        status: "published",
        featured: promptData.featured,
        views: promptData.views,
        sellerId: seller.id,
        categoryId: category.id,
      },
    });

    for (const tagName of promptData.tags) {
      await prisma.promptTag.create({
        data: {
          promptId: promptRecord.id,
          tagId: await getOrCreateTagId(tagName),
        },
      });
    }

    createdPrompts.push({ id: promptRecord.id, price: promptRecord.price, seed: promptData });
  }

  for (let i = 0; i < createdPrompts.length; i++) {
    const { id, seed } = createdPrompts[i];

    for (let r = 0; r < seed.ratings.length; r++) {
      const buyer = buyerUsers[r % buyerUsers.length];

      await prisma.review.create({
        data: {
          promptId: id,
          userId: buyer.id,
          rating: seed.ratings[r],
          comment: REVIEW_COMMENTS[r % REVIEW_COMMENTS.length],
        },
      });
    }
  }

  const purchaseStatuses: Array<"completed" | "pending" | "refunded"> = [
    "completed",
    "completed",
    "completed",
    "completed",
    "pending",
    "refunded",
    "completed",
    "completed",
  ];

  let purchaseIndex = 0;
  for (const { id, price, seed } of createdPrompts) {
    for (let s = 0; s < seed.salesCount; s++) {
      const buyer = buyerUsers[(purchaseIndex + s) % buyerUsers.length];
      const status = purchaseStatuses[(purchaseIndex + s) % purchaseStatuses.length];
      const daysAgo = (purchaseIndex + s) % 21;

      await prisma.purchase.create({
        data: {
          promptId: id,
          buyerId: buyer.id,
          amount: price,
          status,
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        },
      });
    }
    purchaseIndex += seed.salesCount;
  }

  for (let i = 0; i < buyerUsers.length; i++) {
    const buyer = buyerUsers[i];
    const wishlistPrompts = createdPrompts.slice(i, i + 3);

    for (const promptEntry of wishlistPrompts) {
      await prisma.wishlist.create({
        data: {
          userId: buyer.id,
          promptId: promptEntry.id,
        },
      });
    }

    const recentPrompts = createdPrompts.slice(i + 2, i + 6);
    for (let j = 0; j < recentPrompts.length; j++) {
      await prisma.promptView.create({
        data: {
          userId: buyer.id,
          promptId: recentPrompts[j].id,
          viewedAt: new Date(Date.now() - j * 2 * 60 * 60 * 1000),
        },
      });
    }
  }

  const completedSales = createdPrompts.reduce((sum, p) => {
    const completedRatio = 6 / purchaseStatuses.length;
    return sum + Math.round(p.seed.salesCount * completedRatio);
  }, 0);

  console.log(`Seeded ${categories.length} categories`);
  console.log(`Seeded ${sellerUsers.length} sellers`);
  console.log(`Seeded ${buyerUsers.length} buyers`);
  console.log(`Seeded ${createdPrompts.length} prompts`);
  console.log(`Seeded ~${completedSales} completed sales (of ${purchaseIndex} total purchases)`);

  const publishedCount = await prisma.prompt.count({ where: { status: "published" } });
  const categoryCounts = await prisma.category.findMany({
    include: { _count: { select: { prompts: true } } },
    orderBy: { slug: "asc" },
  });
  const titles = await prisma.prompt.findMany({
    select: { title: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Verification: ${publishedCount} published prompts in database`);
  console.log(
    "Category counts:",
    categoryCounts.map((c) => `${c.slug}=${c._count.prompts}`).join(", "),
  );
  console.log(`First title: ${titles[0]?.title}`);
  console.log(`Last title: ${titles.at(-1)?.title}`);
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
