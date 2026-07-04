import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  {
    slug: "marketing",
    name: "Marketing",
    description: "Ads, SEO, and growth campaigns",
    icon: "Megaphone",
  },
  {
    slug: "development",
    name: "Development",
    description: "Code, debugging, and architecture",
    icon: "Code2",
  },
  {
    slug: "writing",
    name: "Writing",
    description: "Copy, blogs, and storytelling",
    icon: "PenLine",
  },
  {
    slug: "design",
    name: "Design",
    description: "UI prompts and creative direction",
    icon: "Palette",
  },
  {
    slug: "business",
    name: "Business",
    description: "Strategy, ops, and productivity",
    icon: "Briefcase",
  },
  {
    slug: "education",
    name: "Education",
    description: "Courses, tutoring, and learning",
    icon: "GraduationCap",
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
] as const;

const PROMPTS = [
  {
    title: "SEO Content Engine",
    description: "Generate rank-ready blog posts, meta descriptions, and keyword clusters in seconds.",
    content: "You are an SEO expert. Given a topic and target keywords, produce a complete blog post outline with meta description and internal linking suggestions.",
    categorySlug: "marketing",
    price: 24.99,
    featured: true,
    tags: ["SEO", "Content", "Blog"],
    sellerIndex: 0,
    views: 1240,
  },
  {
    title: "Full-Stack Code Architect",
    description: "Production-grade code scaffolds with tests, docs, and best practices built in.",
    content: "You are a senior full-stack engineer. Scaffold a production-ready application with tests, documentation, and deployment instructions.",
    categorySlug: "development",
    price: 39.99,
    featured: true,
    tags: ["React", "Node.js", "TypeScript"],
    sellerIndex: 1,
    views: 890,
  },
  {
    title: "Brand Voice Studio",
    description: "Craft consistent brand messaging across ads, emails, and social campaigns.",
    content: "You are a brand strategist. Define a brand voice guide and produce sample copy for ads, emails, and social posts.",
    categorySlug: "writing",
    price: 19.99,
    featured: true,
    tags: ["Copywriting", "Brand", "Ads"],
    sellerIndex: 2,
    views: 756,
  },
  {
    title: "Data Analysis Pro",
    description: "Transform raw datasets into insights, visualizations, and executive summaries.",
    content: "You are a data analyst. Analyze the provided dataset and produce insights, chart recommendations, and an executive summary.",
    categorySlug: "business",
    price: 29.99,
    featured: true,
    tags: ["Python", "Excel", "Reports"],
    sellerIndex: 3,
    views: 680,
  },
  {
    title: "Code Review Assistant",
    description: "Thorough code reviews with security, performance, and style feedback.",
    content: "You are a senior code reviewer. Review the provided code for bugs, security issues, performance problems, and style improvements.",
    categorySlug: "development",
    price: 19.99,
    featured: false,
    tags: ["Code Review", "Security", "Best Practices"],
    sellerIndex: 1,
    views: 890,
  },
  {
    title: "Social Media Calendar",
    description: "Plan a month of engaging social content across platforms.",
    content: "You are a social media strategist. Create a 30-day content calendar with post ideas, captions, and hashtags.",
    categorySlug: "marketing",
    price: 14.99,
    featured: false,
    tags: ["Social Media", "Content", "Planning"],
    sellerIndex: 0,
    views: 540,
  },
  {
    title: "Legal Document Summarizer",
    description: "Plain-language summaries of contracts and legal documents.",
    content: "You are a legal analyst. Summarize the provided legal document in plain language, highlighting key obligations and risks.",
    categorySlug: "business",
    price: 34.99,
    featured: false,
    tags: ["Legal", "Contracts", "Summary"],
    sellerIndex: 3,
    views: 320,
  },
  {
    title: "UI Design Brief Generator",
    description: "Create detailed design briefs from product requirements.",
    content: "You are a UX designer. Generate a comprehensive design brief including user personas, wireframe suggestions, and design system recommendations.",
    categorySlug: "design",
    price: 22.99,
    featured: false,
    tags: ["UI", "UX", "Design"],
    sellerIndex: 2,
    views: 445,
  },
  {
    title: "Email Sequence Builder",
    description: "High-converting email drip campaigns for any niche.",
    content: "You are an email marketing expert. Create a 5-email nurture sequence with subject lines, body copy, and CTAs.",
    categorySlug: "marketing",
    price: 18.99,
    featured: false,
    tags: ["Email", "Conversion", "Copywriting"],
    sellerIndex: 0,
    views: 612,
  },
  {
    title: "API Documentation Writer",
    description: "Generate clear, developer-friendly API docs from endpoints.",
    content: "You are a technical writer. Generate comprehensive API documentation with examples, error codes, and authentication guides.",
    categorySlug: "development",
    price: 27.99,
    featured: false,
    tags: ["API", "Documentation", "Developer"],
    sellerIndex: 1,
    views: 378,
  },
  {
    title: "Course Curriculum Designer",
    description: "Structure complete online courses with modules and assessments.",
    content: "You are an instructional designer. Create a full course curriculum with modules, lessons, quizzes, and learning outcomes.",
    categorySlug: "education",
    price: 31.99,
    featured: false,
    tags: ["Courses", "Education", "Curriculum"],
    sellerIndex: 4,
    views: 290,
  },
  {
    title: "Product Launch Playbook",
    description: "Step-by-step launch plans for SaaS and digital products.",
    content: "You are a product launch strategist. Create a 90-day launch plan with milestones, channels, and success metrics.",
    categorySlug: "business",
    price: 44.99,
    featured: false,
    tags: ["Launch", "SaaS", "Strategy"],
    sellerIndex: 3,
    views: 510,
  },
  {
    title: "Storytelling Framework",
    description: "Narrative structures for blogs, videos, and presentations.",
    content: "You are a storytelling coach. Apply proven narrative frameworks to craft compelling stories for any medium.",
    categorySlug: "writing",
    price: 16.99,
    featured: false,
    tags: ["Storytelling", "Narrative", "Content"],
    sellerIndex: 2,
    views: 425,
  },
  {
    title: "Color Palette Generator",
    description: "Brand-aligned color systems with accessibility checks.",
    content: "You are a color theory expert. Generate a cohesive color palette with hex codes, usage guidelines, and WCAG compliance notes.",
    categorySlug: "design",
    price: 12.99,
    featured: false,
    tags: ["Color", "Branding", "Accessibility"],
    sellerIndex: 2,
    views: 380,
  },
  {
    title: "Meeting Notes Summarizer",
    description: "Turn meeting transcripts into action items and decisions.",
    content: "You are an executive assistant. Summarize meeting notes into key decisions, action items with owners, and follow-up dates.",
    categorySlug: "business",
    price: 9.99,
    featured: false,
    tags: ["Productivity", "Meetings", "Notes"],
    sellerIndex: 4,
    views: 720,
  },
  {
    title: "Quiz Generator Pro",
    description: "Create engaging quizzes for education and lead generation.",
    content: "You are an assessment designer. Generate quiz questions with multiple choice answers, explanations, and difficulty levels.",
    categorySlug: "education",
    price: 15.99,
    featured: false,
    tags: ["Quiz", "Assessment", "Learning"],
    sellerIndex: 4,
    views: 340,
  },
  {
    title: "Ad Copy Variations",
    description: "Generate dozens of ad copy variants for A/B testing.",
    content: "You are a performance marketer. Generate 10 ad copy variations for different platforms with headlines, body text, and CTAs.",
    categorySlug: "marketing",
    price: 21.99,
    featured: false,
    tags: ["Ads", "A/B Testing", "Copywriting"],
    sellerIndex: 0,
    views: 890,
  },
  {
    title: "Database Schema Designer",
    description: "Design normalized database schemas from requirements.",
    content: "You are a database architect. Design a normalized schema with tables, relationships, indexes, and migration notes.",
    categorySlug: "development",
    price: 32.99,
    featured: false,
    tags: ["Database", "SQL", "Architecture"],
    sellerIndex: 1,
    views: 410,
  },
  {
    title: "Pitch Deck Narrative",
    description: "Investor-ready pitch deck content and speaker notes.",
    content: "You are a startup advisor. Create pitch deck slide content with speaker notes for a seed-stage startup.",
    categorySlug: "business",
    price: 49.99,
    featured: false,
    tags: ["Pitch Deck", "Startup", "Fundraising"],
    sellerIndex: 3,
    views: 560,
  },
  {
    title: "Blog Post Outliner",
    description: "SEO-optimized blog outlines with headings and keywords.",
    content: "You are a content strategist. Create a detailed blog post outline with H2/H3 headings, keyword placement, and word count targets.",
    categorySlug: "writing",
    price: 11.99,
    featured: false,
    tags: ["Blog", "SEO", "Outline"],
    sellerIndex: 2,
    views: 650,
  },
  {
    title: "Icon Set Brief",
    description: "Detailed briefs for custom icon set design projects.",
    content: "You are an icon designer. Create a comprehensive brief for a custom icon set including style, grid, and usage guidelines.",
    categorySlug: "design",
    price: 17.99,
    featured: false,
    tags: ["Icons", "Design", "Brief"],
    sellerIndex: 2,
    views: 280,
  },
  {
    title: "Study Guide Creator",
    description: "Comprehensive study guides from textbooks and lectures.",
    content: "You are an academic tutor. Create a structured study guide with key concepts, practice questions, and memory aids.",
    categorySlug: "education",
    price: 13.99,
    featured: false,
    tags: ["Study", "Learning", "Education"],
    sellerIndex: 4,
    views: 490,
  },
  {
    title: "Customer Persona Builder",
    description: "Detailed buyer personas from market research data.",
    content: "You are a market researcher. Build detailed customer personas with demographics, pain points, goals, and buying triggers.",
    categorySlug: "marketing",
    price: 23.99,
    featured: false,
    tags: ["Persona", "Research", "Marketing"],
    sellerIndex: 0,
    views: 530,
  },
  {
    title: "Bug Report Analyzer",
    description: "Triage and prioritize bug reports with fix suggestions.",
    content: "You are a QA lead. Analyze bug reports, assign severity, suggest root causes, and recommend fixes.",
    categorySlug: "development",
    price: 26.99,
    featured: false,
    tags: ["QA", "Debugging", "Triage"],
    sellerIndex: 1,
    views: 360,
  },
  {
    title: "Weekly Report Generator",
    description: "Professional weekly status reports for teams and clients.",
    content: "You are a project manager. Generate a weekly status report with accomplishments, blockers, and next steps.",
    categorySlug: "business",
    price: 8.99,
    featured: false,
    tags: ["Reports", "Productivity", "PM"],
    sellerIndex: 4,
    views: 810,
  },
] as const;

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

function randomRating() {
  const ratings = [5, 5, 5, 4, 4, 4, 5, 4, 3, 5];
  return ratings[Math.floor(Math.random() * ratings.length)];
}

async function main() {
  console.log("Seeding marketplace database...");

  await prisma.promptView.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.promptTag.deleteMany();
  await prisma.prompt.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.user.deleteMany();

  const categories = await Promise.all(
    CATEGORIES.map((cat) =>
      prisma.category.create({
        data: cat,
      }),
    ),
  );
  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const sellerUsers = await Promise.all(
    SELLERS.map((seller) =>
      prisma.user.create({
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
    ),
  );

  const buyerUsers = await Promise.all(
    BUYERS.map((buyer) =>
      prisma.user.create({
        data: {
          clerkUserId: buyer.clerkUserId,
          username: buyer.username,
          email: buyer.email,
          role: "buyer",
        },
      }),
    ),
  );

  const tagCache = new Map<string, string>();

  async function getOrCreateTag(name: string) {
    const cached = tagCache.get(name);
    if (cached) return cached;

    const tag = await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    tagCache.set(name, tag.id);
    return tag.id;
  }

  const createdPrompts = [];

  for (const promptData of PROMPTS) {
    const seller = sellerUsers[promptData.sellerIndex];
    const category = categoryBySlug[promptData.categorySlug];

    const prompt = await prisma.prompt.create({
      data: {
        title: promptData.title,
        description: promptData.description,
        content: promptData.content,
        price: promptData.price,
        status: "published",
        featured: promptData.featured,
        views: promptData.views,
        sellerId: seller.id,
        categoryId: category.id,
        tags: {
          create: await Promise.all(
            promptData.tags.map(async (tagName) => ({
              tag: { connect: { id: await getOrCreateTag(tagName) } },
            })),
          ),
        },
      },
    });

    createdPrompts.push(prompt);
  }

  for (let i = 0; i < createdPrompts.length; i++) {
    const prompt = createdPrompts[i];
    const reviewCount = Math.min(3 + (i % 3), buyerUsers.length);

    for (let r = 0; r < reviewCount; r++) {
      const buyer = buyerUsers[r % buyerUsers.length];

      await prisma.review.create({
        data: {
          promptId: prompt.id,
          userId: buyer.id,
          rating: randomRating(),
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

  for (let i = 0; i < 30; i++) {
    const prompt = createdPrompts[i % createdPrompts.length];
    const buyer = buyerUsers[i % buyerUsers.length];
    const status = purchaseStatuses[i % purchaseStatuses.length];
    const daysAgo = i % 14;

    await prisma.purchase.create({
      data: {
        promptId: prompt.id,
        buyerId: buyer.id,
        amount: prompt.price,
        status,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }

  for (let i = 0; i < buyerUsers.length; i++) {
    const buyer = buyerUsers[i];
    const wishlistPrompts = createdPrompts.slice(i, i + 3);

    for (const prompt of wishlistPrompts) {
      await prisma.wishlist.create({
        data: {
          userId: buyer.id,
          promptId: prompt.id,
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

  console.log(`Seeded ${categories.length} categories`);
  console.log(`Seeded ${sellerUsers.length} sellers`);
  console.log(`Seeded ${buyerUsers.length} buyers`);
  console.log(`Seeded ${createdPrompts.length} prompts`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
