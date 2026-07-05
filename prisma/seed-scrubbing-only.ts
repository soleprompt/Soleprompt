/**
 * Incremental seed: upserts scrubbing marketplace listings without wiping data.
 * Safe to run on production when db:seed (full wipe) was not executed.
 *
 * Usage: npm run db:seed:scrubbing
 */
import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { CatalogEntry } from "./seed-data/helpers";
import { SCRUBBING_PROMPTS } from "./seed-data/scrubbing-prompts";
import { X_SCRUBBING_TOOL } from "./seed-data/x-scrubbing-tool";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL?.replace("-pooler", "");
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const SCRUBBING_CATALOG: CatalogEntry[] = [
  X_SCRUBBING_TOOL,
  ...SCRUBBING_PROMPTS,
];

const CATEGORY_DEFS = [
  {
    slug: "marketing",
    name: "Marketing",
    description: "Ads, campaigns, social media, and growth",
    icon: "Megaphone",
  },
  {
    slug: "productivity",
    name: "Productivity",
    description: "Planning, focus, habits, and time management",
    icon: "Zap",
  },
] as const;

const FALLBACK_SELLER = {
  clerkUserId: "seed_seller_marcus",
  username: "marcuswebb",
  email: "marcus@soleprompt.dev",
  displayName: "Marcus Webb",
} as const;

async function withSeedLock<T>(fn: () => Promise<T>): Promise<T> {
  await prisma.$executeRaw`SELECT pg_advisory_lock(hashtext('soleprompt-seed-scrubbing'))`;
  try {
    return await fn();
  } finally {
    await prisma.$executeRaw`SELECT pg_advisory_unlock(hashtext('soleprompt-seed-scrubbing'))`;
  }
}

async function ensureCategories() {
  const bySlug = new Map<string, { id: string; slug: string }>();

  for (const cat of CATEGORY_DEFS) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
      },
    });
    bySlug.set(row.slug, row);
  }

  return bySlug;
}

async function resolveSellerId(): Promise<string> {
  const existingSeedSeller = await prisma.user.findUnique({
    where: { clerkUserId: FALLBACK_SELLER.clerkUserId },
    select: { id: true },
  });
  if (existingSeedSeller) {
    return existingSeedSeller.id;
  }

  const anySeller = await prisma.user.findFirst({
    where: { role: "seller", sellerProfile: { isNot: null } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (anySeller) {
    return anySeller.id;
  }

  const created = await prisma.user.create({
    data: {
      clerkUserId: FALLBACK_SELLER.clerkUserId,
      username: FALLBACK_SELLER.username,
      email: FALLBACK_SELLER.email,
      role: "seller",
      sellerProfile: {
        create: {
          displayName: FALLBACK_SELLER.displayName,
          bio: "Premium prompt creator specializing in social media and marketing.",
        },
      },
    },
  });

  return created.id;
}

async function upsertPromptListing(
  entry: CatalogEntry,
  sellerId: string,
  categoryId: string,
  tagIds: Map<string, string>,
) {
  const existing = await prisma.prompt.findFirst({
    where: { title: entry.title },
    select: { id: true },
  });

  const promptData = {
    title: entry.title,
    description: entry.description,
    content: entry.content,
    preview: entry.preview,
    compatibleModels: entry.compatibleModels,
    sampleOutput: entry.sampleOutput,
    difficulty: entry.difficulty,
    estimatedTimeSaved: entry.estimatedTimeSaved,
    coverImageUrl: entry.coverImageUrl,
    price: entry.price,
    status: "published" as const,
    featured: entry.featured ?? false,
    sellerId,
    categoryId,
  };

  const prompt = existing
    ? await prisma.prompt.update({
        where: { id: existing.id },
        data: promptData,
      })
    : await prisma.prompt.create({ data: promptData });

  await prisma.promptTag.deleteMany({ where: { promptId: prompt.id } });

  for (const tagName of entry.tags) {
    let tagId = tagIds.get(tagName);
    if (!tagId) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        create: { name: tagName },
        update: {},
      });
      tagId = tag.id;
      tagIds.set(tagName, tagId);
    }

    await prisma.promptTag.create({
      data: { promptId: prompt.id, tagId },
    });
  }

  return { id: prompt.id, title: prompt.title, created: !existing };
}

async function main() {
  await withSeedLock(async () => {
    console.log("Upserting scrubbing marketplace listings (no wipe)...");

    const categories = await ensureCategories();
    const sellerId = await resolveSellerId();
    const tagIds = new Map<string, string>();

    let created = 0;
    let updated = 0;

    for (const entry of SCRUBBING_CATALOG) {
      const category = categories.get(entry.categorySlug);
      if (!category) {
        throw new Error(`Missing category slug: ${entry.categorySlug}`);
      }

      const result = await upsertPromptListing(
        entry,
        sellerId,
        category.id,
        tagIds,
      );

      if (result.created) {
        created++;
        console.log(`  + created: ${result.title}`);
      } else {
        updated++;
        console.log(`  ~ updated: ${result.title}`);
      }
    }

    const scrubber = await prisma.prompt.findFirst({
      where: { title: X_SCRUBBING_TOOL.title, status: "published" },
      select: { id: true, title: true, price: true },
    });

    console.log("");
    console.log(`Done: ${created} created, ${updated} updated (${SCRUBBING_CATALOG.length} total).`);
    if (scrubber) {
      console.log(
        `X Scrubbing Tool: id=${scrubber.id}, price=$${scrubber.price.toFixed(2)}`,
      );
    }
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
