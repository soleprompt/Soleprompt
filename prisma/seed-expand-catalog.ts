/**
 * Non-destructive catalog expansion — adds new prompts without wiping the database.
 * Run: npm run db:seed:expand
 */
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { BULK_CATALOG } from "./seed-data/bulk-catalog";
import { BUNDLES } from "./seed-data/bundles";
import { REAL_ESTATE_PROMPTS } from "./seed-data/real-estate-prompts";
import { SALES_PROMPTS } from "./seed-data/sales-prompts";
import { SOCIAL_MEDIA_PROMPTS } from "./seed-data/social-media-prompts";
import type { CatalogEntry } from "./seed-data/helpers";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL?.replace("-pooler", "");
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const NEW_CATALOG: CatalogEntry[] = [
  ...SALES_PROMPTS,
  ...SOCIAL_MEDIA_PROMPTS,
  ...REAL_ESTATE_PROMPTS,
  ...BULK_CATALOG,
  ...BUNDLES.filter((b) =>
    ["Sales Closer AI Pack", "Social Media God Bundle"].includes(b.title),
  ),
];

const CATEGORIES = [
  { slug: "productivity", name: "Productivity", description: "Planning, focus, habits, and time management", icon: "Zap" },
  { slug: "business", name: "Business", description: "Strategy, operations, sales, and leadership", icon: "Briefcase" },
  { slug: "marketing", name: "Marketing", description: "Ads, campaigns, social media, and growth", icon: "Megaphone" },
  { slug: "coding", name: "Coding", description: "Code review, debugging, APIs, and dev tools", icon: "Code2" },
  { slug: "finance", name: "Finance", description: "Budgeting, investing, and financial planning", icon: "Wallet" },
  { slug: "writing", name: "Writing", description: "Copy, blogs, resumes, and creative writing", icon: "PenLine" },
  { slug: "education", name: "Education", description: "Lesson plans, assessments, and teaching tools", icon: "GraduationCap" },
  { slug: "sales", name: "Sales", description: "Outreach, proposals, objection handling, and closing", icon: "Target" },
  { slug: "solar", name: "Solar", description: "ROI calculators, proposals, and solar sales workflows", icon: "Sun" },
  { slug: "social-media", name: "Social Media", description: "Content, audits, profile cleanup, and growth", icon: "Share2" },
  { slug: "real-estate", name: "Real Estate", description: "Listings, market analysis, and client communication", icon: "Home" },
] as const;

async function main() {
  console.log("Expanding catalog (non-destructive)...");

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: { name: cat.name, description: cat.description, icon: cat.icon },
    });
  }

  const categories = await prisma.category.findMany();
  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const seller = await prisma.user.findFirst({
    where: { role: "seller" },
    orderBy: { createdAt: "asc" },
  });

  if (!seller) {
    throw new Error("No seller found — run full seed first or create a seller account.");
  }

  const tagCache = new Map<string, string>();

  async function getTagId(name: string) {
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

  let created = 0;
  let skipped = 0;

  for (const entry of NEW_CATALOG) {
    const existing = await prisma.prompt.findFirst({
      where: { title: entry.title },
    });

    if (existing) {
      skipped++;
      continue;
    }

    const category = categoryBySlug[entry.categorySlug];
    if (!category) {
      console.warn(`Skip "${entry.title}" — unknown category ${entry.categorySlug}`);
      continue;
    }

    const prompt = await prisma.prompt.create({
      data: {
        title: entry.title,
        description: entry.description,
        content: entry.content,
        preview: entry.preview,
        compatibleModels: entry.compatibleModels,
        sampleOutput: entry.sampleOutput,
        difficulty: entry.difficulty,
        estimatedTimeSaved: entry.estimatedTimeSaved,
        coverImageUrl: entry.coverImageUrl || null,
        price: entry.price,
        status: "published",
        featured: entry.featured ?? false,
        views: 50 + created * 11,
        sellerId: seller.id,
        categoryId: category.id,
      },
    });

    for (const tagName of entry.tags) {
      await prisma.promptTag.create({
        data: { promptId: prompt.id, tagId: await getTagId(tagName) },
      });
    }

    created++;
    console.log(`  + ${entry.title}`);
  }

  console.log(`Done. Created ${created}, skipped ${skipped} (already exist).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
