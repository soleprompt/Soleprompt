import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { BUNDLES } from "./seed-data/bundles";
import { SCRUBBING_PROMPTS } from "./seed-data/scrubbing-prompts";
import { STARTER_PROMPTS } from "./seed-data/starter-prompts";
import { WELCOME_PACK } from "./seed-data/welcome-pack";
import { X_SCRUBBING_TOOL } from "./seed-data/x-scrubbing-tool";
import { SOCIAL_SCRUBBING_SUITE } from "./seed-data/social-scrubbing-suite";
import type { CatalogEntry } from "./seed-data/helpers";

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
    slug: "productivity",
    name: "Productivity",
    description: "Planning, focus, habits, and time management",
    icon: "Zap",
  },
  {
    slug: "business",
    name: "Business",
    description: "Strategy, operations, sales, and leadership",
    icon: "Briefcase",
  },
  {
    slug: "marketing",
    name: "Marketing",
    description: "Ads, campaigns, social media, and growth",
    icon: "Megaphone",
  },
  {
    slug: "coding",
    name: "Coding",
    description: "Code review, debugging, APIs, and dev tools",
    icon: "Code2",
  },
  {
    slug: "finance",
    name: "Finance",
    description: "Budgeting, investing, and financial planning",
    icon: "Wallet",
  },
  {
    slug: "writing",
    name: "Writing",
    description: "Copy, blogs, resumes, and creative writing",
    icon: "PenLine",
  },
  {
    slug: "education",
    name: "Education",
    description: "Lesson plans, assessments, and teaching tools",
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
  { clerkUserId: "seed_buyer_6", username: "taylor_n", email: "taylor.n@example.com" },
  { clerkUserId: "seed_buyer_7", username: "morgan_l", email: "morgan.l@example.com" },
  { clerkUserId: "seed_buyer_8", username: "drew_h", email: "drew.h@example.com" },
] as const;

const CATALOG: CatalogEntry[] = [
  WELCOME_PACK,
  X_SCRUBBING_TOOL,
  SOCIAL_SCRUBBING_SUITE,
  ...SCRUBBING_PROMPTS,
  ...STARTER_PROMPTS,
  ...BUNDLES,
];

type PromptSeed = CatalogEntry & {
  featured: boolean;
  sellerIndex: number;
  views: number;
  salesCount: number;
  ratings: number[];
};

function buildCatalogPrompts(): PromptSeed[] {
  const ratingPool = [5, 5, 4, 5, 4, 4, 5, 3, 5, 4];

  return CATALOG.map((definition, index) => {
    const sellerIndex = definition.sellerIndex ?? index % SELLERS.length;
    const views = 120 + index * 23;
    const salesCount =
      definition.price <= 0 ? 0 : 2 + (index * 5) % 32;
    const ratings = [
      ratingPool[index % ratingPool.length],
      ratingPool[(index + 2) % ratingPool.length],
      ratingPool[(index + 5) % ratingPool.length],
    ];

    return {
      ...definition,
      featured: definition.featured ?? index < 6,
      sellerIndex,
      views,
      salesCount,
      ratings,
    };
  });
}

const PROMPTS = buildCatalogPrompts();

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
    prisma.transaction.deleteMany(),
    prisma.purchase.deleteMany(),
    prisma.promptTag.deleteMany(),
    prisma.prompt.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.auditLog.deleteMany(),
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
          difficulty: promptData.difficulty,
          estimatedTimeSaved: promptData.estimatedTimeSaved,
          coverImageUrl: promptData.coverImageUrl,
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

    const starterCount = STARTER_PROMPTS.length;
    const scrubbingCount = SCRUBBING_PROMPTS.length;
    const bundleCount = BUNDLES.length;

    console.log(`Seeded ${categories.length} categories`);
    console.log(`Seeded ${sellerUsers.length} sellers`);
    console.log(`Seeded ${buyerUsers.length} buyers`);
    console.log(
      `Seeded Welcome Pack + X Scrubbing Tool + ${scrubbingCount} scrubbing prompts + ${starterCount} starter prompts + ${bundleCount} bundles = ${createdPrompts.length} total listings`,
    );
    console.log("Skipped fake purchase records — live sales come from Stripe checkout");

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
