import { prisma } from "@/lib/db";
import { safeDbRead } from "@/lib/safe-db";
import { X_SCRUBBER_PRODUCT_TITLE } from "@/lib/scrubber/constants";
import type { Category, Prompt } from "@/types";
import type { PromptStatus, PurchaseStatus } from "@/generated/prisma/client";

const promptInclude = {
  category: true,
  seller: { include: { sellerProfile: true } },
  tags: { include: { tag: true } },
  reviews: { select: { rating: true } },
  _count: { select: { reviews: true, purchases: true } },
} as const;

type PromptWithRelations = Awaited<
  ReturnType<typeof prisma.prompt.findMany<{ include: typeof promptInclude }>>
>[number];

const EMPTY_MARKETPLACE_STATS = [
  { id: "1", label: "Premium Prompts", value: "0", suffix: "" },
  { id: "2", label: "Active Creators", value: "0", suffix: "" },
  { id: "3", label: "Happy Buyers", value: "0", suffix: "" },
  { id: "4", label: "Avg. Rating", value: "0", suffix: "/5" },
] as const;

export function mapPromptToListItem(prompt: PromptWithRelations): Prompt {
  const ratings = prompt.reviews.map((r) => r.rating);
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

  const sellerProfile = prompt.seller.sellerProfile;

  return {
    id: prompt.id,
    title: prompt.title,
    description: prompt.description,
    content: prompt.content,
    preview: prompt.preview,
    sampleOutput: prompt.sampleOutput,
    category: prompt.category.name,
    price: prompt.price,
    rating: Math.round(avgRating * 10) / 10,
    reviews: prompt._count.reviews,
    salesCount: prompt._count.purchases,
    viewCount: prompt.views,
    author: sellerProfile?.displayName ?? prompt.seller.username,
    seller: {
      displayName: sellerProfile?.displayName ?? prompt.seller.username,
      username: prompt.seller.username,
      bio: sellerProfile?.bio ?? null,
    },
    tags: prompt.tags.map((t) => t.tag.name),
    compatibleModels: prompt.compatibleModels,
    difficulty: prompt.difficulty,
    estimatedTimeSaved: prompt.estimatedTimeSaved,
    coverImageUrl: prompt.coverImageUrl,
    createdAt: prompt.createdAt.toISOString(),
  };
}

export async function getFeaturedPrompts(limit = 4): Promise<Prompt[]> {
  return safeDbRead([], async () => {
    const prompts = await prisma.prompt.findMany({
      where: { status: "published", featured: true },
      include: promptInclude,
      orderBy: [{ reviews: { _count: "desc" } }, { createdAt: "desc" }],
      take: limit,
    });

    if (prompts.length >= limit) {
      return prompts.map(mapPromptToListItem);
    }

    const remaining = limit - prompts.length;
    const additional = await prisma.prompt.findMany({
      where: {
        status: "published",
        id: { notIn: prompts.map((p) => p.id) },
      },
      include: promptInclude,
      orderBy: { createdAt: "desc" },
      take: remaining,
    });

    return [...prompts, ...additional].map(mapPromptToListItem);
  });
}

export type PromptSortOption =
  | "newest"
  | "popular"
  | "trending"
  | "rating"
  | "price_asc"
  | "price_desc";

export async function getPublishedPrompts(options?: {
  categorySlug?: string;
  search?: string;
  limit?: number;
  sort?: PromptSortOption;
  freeOnly?: boolean;
  maxPrice?: number;
  minRating?: number;
  compatibleModel?: string;
}): Promise<Prompt[]> {
  return safeDbRead([], async () => {
    const search = options?.search?.trim();
    const sort = options?.sort ?? "newest";

    const orderBy = (() => {
      switch (sort) {
        case "popular":
          return [{ purchases: { _count: "desc" as const } }, { createdAt: "desc" as const }];
        case "trending":
          return [{ views: "desc" as const }, { purchases: { _count: "desc" as const } }];
        case "rating":
          return [{ reviews: { _count: "desc" as const } }, { createdAt: "desc" as const }];
        case "price_asc":
          return [{ price: "asc" as const }];
        case "price_desc":
          return [{ price: "desc" as const }];
        default:
          return [{ featured: "desc" as const }, { createdAt: "desc" as const }];
      }
    })();

    const prompts = await prisma.prompt.findMany({
      where: {
        status: "published",
        ...(options?.categorySlug
          ? { category: { slug: options.categorySlug } }
          : {}),
        ...(options?.freeOnly ? { price: { lte: 0 } } : {}),
        ...(options?.maxPrice !== undefined
          ? { price: { lte: options.maxPrice } }
          : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { tags: { some: { tag: { name: { contains: search, mode: "insensitive" } } } } },
              ],
            }
          : {}),
      },
      include: promptInclude,
      orderBy,
      take: options?.minRating ? undefined : options?.limit,
    });

    let results = prompts.map(mapPromptToListItem);

    if (options?.minRating) {
      results = results.filter((p) => p.rating >= (options.minRating ?? 0));
      if (options.limit) {
        results = results.slice(0, options.limit);
      }
    }

    if (options?.compatibleModel) {
      const needle = options.compatibleModel.toLowerCase();
      results = results.filter((p) =>
        p.compatibleModels.some((m) => m.toLowerCase().includes(needle)),
      );
      if (options.limit) {
        results = results.slice(0, options.limit);
      }
    }

    return results;
  });
}

export async function getTrendingPrompts(limit = 6): Promise<Prompt[]> {
  return getPublishedPrompts({ sort: "trending", limit });
}

export async function getTrendingPromptIds(limit = 24): Promise<string[]> {
  const prompts = await getTrendingPrompts(limit);
  return prompts.map((p) => p.id);
}

export async function getRelatedPrompts(
  promptId: string,
  categorySlug: string,
  tags: string[],
  limit = 4,
): Promise<Prompt[]> {
  return safeDbRead([], async () => {
    const tagFilter =
      tags.length > 0
        ? {
            tags: {
              some: { tag: { name: { in: tags.slice(0, 3) } } },
            },
          }
        : {};

    const prompts = await prisma.prompt.findMany({
      where: {
        status: "published",
        id: { not: promptId },
        category: { slug: categorySlug },
        ...tagFilter,
      },
      include: promptInclude,
      orderBy: [
        { purchases: { _count: "desc" } },
        { views: "desc" },
      ],
      take: limit,
    });

    if (prompts.length >= limit) {
      return prompts.map(mapPromptToListItem);
    }

    const excludeIds = [promptId, ...prompts.map((p) => p.id)];
    const more = await prisma.prompt.findMany({
      where: {
        status: "published",
        id: { notIn: excludeIds },
        category: { slug: categorySlug },
      },
      include: promptInclude,
      orderBy: { createdAt: "desc" },
      take: limit - prompts.length,
    });

    return [...prompts, ...more].map(mapPromptToListItem);
  });
}

export async function getCustomersAlsoBought(
  promptId: string,
  limit = 4,
): Promise<Prompt[]> {
  return safeDbRead([], async () => {
    const buyers = await prisma.purchase.findMany({
      where: { promptId, status: "completed" },
      select: { buyerId: true },
      take: 50,
    });

    const buyerIds = [...new Set(buyers.map((b) => b.buyerId))];
    if (buyerIds.length === 0) {
      return getPublishedPrompts({ sort: "popular", limit });
    }

    const coPurchases = await prisma.purchase.findMany({
      where: {
        buyerId: { in: buyerIds },
        promptId: { not: promptId },
        status: "completed",
      },
      select: { promptId: true },
    });

    const counts = new Map<string, number>();
    for (const row of coPurchases) {
      counts.set(row.promptId, (counts.get(row.promptId) ?? 0) + 1);
    }

    const topIds = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    if (topIds.length === 0) {
      return getPublishedPrompts({ sort: "popular", limit });
    }

    const prompts = await prisma.prompt.findMany({
      where: { id: { in: topIds }, status: "published" },
      include: promptInclude,
    });

    const order = new Map(topIds.map((id, i) => [id, i]));
    return prompts
      .sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99))
      .map(mapPromptToListItem);
  });
}

export async function getPromptOfTheDay(): Promise<Prompt | null> {
  return safeDbRead(null, async () => {
    const prompts = await prisma.prompt.findMany({
      where: { status: "published" },
      include: promptInclude,
      orderBy: { id: "asc" },
    });

    if (prompts.length === 0) return null;

    const dayIndex = Math.floor(Date.now() / 86_400_000);
    const selected = prompts[dayIndex % prompts.length];
    return mapPromptToListItem(selected);
  });
}

export async function getCreatorByUsername(username: string) {
  return safeDbRead(null, async () => {
    const user = await prisma.user.findFirst({
      where: { username },
      include: {
        sellerProfile: true,
        prompts: {
          where: { status: "published" },
          include: promptInclude,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            prompts: { where: { status: "published" } },
            sellerTransactions: { where: { status: "completed" } },
          },
        },
      },
    });

    if (!user?.sellerProfile) return null;

    const allReviews = user.prompts.flatMap((p) => p.reviews);
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    return {
      username: user.username,
      displayName: user.sellerProfile.displayName,
      bio: user.sellerProfile.bio,
      salesCount: user.sellerProfile.salesCount,
      totalEarnings: user.sellerProfile.totalEarnings,
      promptCount: user._count.prompts,
      totalSales: user._count.sellerTransactions,
      avgRating: Math.round(avgRating * 10) / 10,
      prompts: user.prompts.map(mapPromptToListItem),
    };
  });
}

export async function isPromptWishlisted(
  clerkUserId: string,
  promptId: string,
): Promise<boolean> {
  return safeDbRead(false, async () => {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) return false;

    const item = await prisma.wishlist.findUnique({
      where: { userId_promptId: { userId: user.id, promptId } },
      select: { id: true },
    });

    return Boolean(item);
  });
}

export async function getUserReviewForPrompt(
  clerkUserId: string,
  promptId: string,
) {
  return safeDbRead(null, async () => {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) return null;

    return prisma.review.findUnique({
      where: { promptId_userId: { promptId, userId: user.id } },
    });
  });
}

export async function getPromptById(id: string) {
  return prisma.prompt.findUnique({
    where: { id },
    include: {
      ...promptInclude,
      reviews: {
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getPromptPurchaseState(
  clerkUserId: string | null | undefined,
  promptId: string,
  sellerId: string,
) {
  if (!clerkUserId) {
    return { purchased: false, isOwnPrompt: false };
  }

  return safeDbRead(
    { purchased: false, isOwnPrompt: false },
    async () => {
      const user = await prisma.user.findUnique({
        where: { clerkUserId },
        select: { id: true },
      });

      if (!user) {
        return { purchased: false, isOwnPrompt: false };
      }

      const purchased = Boolean(
        await prisma.purchase.findFirst({
          where: {
            buyerId: user.id,
            promptId,
            status: "completed",
          },
          select: { id: true },
        }),
      );

      return {
        purchased,
        isOwnPrompt: user.id === sellerId,
      };
    },
  );
}

export async function getCategoriesWithCounts(): Promise<Category[]> {
  return safeDbRead([], async () => {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { prompts: { where: { status: "published" } } } },
      },
      orderBy: { name: "asc" },
    });

    return categories.map((cat) => ({
      id: cat.slug,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      count: cat._count.prompts,
    }));
  });
}

export async function getPublishedPromptCount(): Promise<number> {
  return safeDbRead(0, async () => {
    return prisma.prompt.count({ where: { status: "published" } });
  });
}

export function formatToolCountDisplay(count: number): string {
  if (count <= 0) return "500+";
  if (count < 500) return String(count);
  const rounded = Math.floor(count / 50) * 50;
  return `${rounded}+`;
}

export interface TrustMetrics {
  totalDownloads: number;
  verifiedBuyers: number;
  avgRating: number;
  reviewCount: number;
  toolCount: number;
}

export async function getTrustMetrics(): Promise<TrustMetrics> {
  return safeDbRead(
    {
      totalDownloads: 0,
      verifiedBuyers: 0,
      avgRating: 0,
      reviewCount: 0,
      toolCount: 0,
    },
    async () => {
      const [totalDownloads, verifiedBuyers, reviewAgg, reviewCount, toolCount] =
        await Promise.all([
          prisma.purchase.count({ where: { status: "completed" } }),
          prisma.purchase
            .groupBy({
              by: ["buyerId"],
              where: { status: "completed" },
            })
            .then((groups) => groups.length),
          prisma.review.aggregate({ _avg: { rating: true } }),
          prisma.review.count(),
          prisma.prompt.count({ where: { status: "published" } }),
        ]);

      return {
        totalDownloads,
        verifiedBuyers,
        avgRating: Math.round((reviewAgg._avg.rating ?? 0) * 10) / 10,
        reviewCount,
        toolCount,
      };
    },
  );
}

export async function getMarketplaceStats() {
  return safeDbRead([...EMPTY_MARKETPLACE_STATS], async () => {
    const [promptCount, sellerCount, buyerCount, avgRatingResult] =
      await Promise.all([
        prisma.prompt.count({ where: { status: "published" } }),
        prisma.user.count({ where: { role: "seller" } }),
        prisma.purchase.count({ where: { status: "completed" } }),
        prisma.review.aggregate({ _avg: { rating: true } }),
      ]);

    const avgRating = avgRatingResult._avg.rating ?? 0;

    return [
      {
        id: "1",
        label: "Premium Prompts",
        value: String(promptCount),
        suffix: promptCount >= 1000 ? "+" : "",
      },
      {
        id: "2",
        label: "Active Creators",
        value: String(sellerCount),
        suffix: sellerCount >= 100 ? "+" : "",
      },
      {
        id: "3",
        label: "Happy Buyers",
        value: String(buyerCount),
        suffix: buyerCount >= 100 ? "+" : "",
      },
      {
        id: "4",
        label: "Avg. Rating",
        value: avgRating > 0 ? avgRating.toFixed(1) : "0",
        suffix: "/5",
      },
    ];
  });
}

export async function getPopularSearchTerms(limit = 4): Promise<string[]> {
  return safeDbRead(
    ["SEO prompts", "Code generation", "Marketing copy", "Data analysis"],
    async () => {
      const tags = await prisma.tag.findMany({
        include: { _count: { select: { prompts: true } } },
        orderBy: { prompts: { _count: "desc" } },
        take: limit,
      });

      if (tags.length > 0) {
        return tags.map((t) => t.name);
      }

      return ["SEO prompts", "Code generation", "Marketing copy", "Data analysis"];
    },
  );
}

export async function getBuyerPurchases(clerkUserId: string) {
  return safeDbRead([], async () => {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) return [];

    const purchases = await prisma.purchase.findMany({
      where: { buyerId: user.id, status: "completed" },
      include: {
        prompt: {
          include: promptInclude,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return purchases.map((p) => ({
      id: p.id,
      purchasedAt: p.createdAt,
      amount: p.amount,
      prompt: mapPromptToListItem(p.prompt),
    }));
  });
}

export function buyerOwnsScrubberTool(
  purchases: Awaited<ReturnType<typeof getBuyerPurchases>>,
): boolean {
  return purchases.some((p) => p.prompt.title === X_SCRUBBER_PRODUCT_TITLE);
}

export async function getBuyerPurchaseHistory(clerkUserId: string) {
  return safeDbRead([], async () => {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) return [];

    const purchases = await prisma.purchase.findMany({
      where: { buyerId: user.id },
      include: {
        prompt: { select: { id: true, title: true } },
        transaction: {
          select: {
            id: true,
            stripeSessionId: true,
            stripePaymentId: true,
            currency: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return purchases.map((p) => ({
      id: p.id,
      promptId: p.prompt.id,
      promptTitle: p.prompt.title,
      amount: p.amount,
      isFree: p.amount <= 0,
      status: p.status as PurchaseStatus,
      date: p.createdAt.toISOString(),
      transactionId: p.transaction?.id ?? null,
      stripePaymentId: p.transaction?.stripePaymentId ?? null,
    }));
  });
}

export async function getBuyerWishlist(clerkUserId: string) {
  return safeDbRead([], async () => {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) return [];

    const items = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: { prompt: { include: promptInclude } },
      orderBy: { createdAt: "desc" },
    });

    return items.map((item) => ({
      id: item.id,
      addedAt: item.createdAt,
      prompt: mapPromptToListItem(item.prompt),
    }));
  });
}

export async function getBuyerRecentlyViewed(clerkUserId: string) {
  return safeDbRead([], async () => {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) return [];

    const views = await prisma.promptView.findMany({
      where: { userId: user.id },
      include: { prompt: { include: promptInclude } },
      orderBy: { viewedAt: "desc" },
      take: 20,
    });

    const seen = new Set<string>();
    const unique: typeof views = [];

    for (const view of views) {
      if (seen.has(view.promptId)) continue;
      seen.add(view.promptId);
      unique.push(view);
    }

    return unique.map((view) => ({
      id: view.id,
      viewedAt: view.viewedAt,
      prompt: mapPromptToListItem(view.prompt),
    }));
  });
}

export async function recordPromptView(
  clerkUserId: string | null | undefined,
  promptId: string,
) {
  const user = clerkUserId
    ? await prisma.user.findUnique({ where: { clerkUserId } })
    : null;

  if (user) {
    await prisma.$transaction([
      prisma.promptView.create({
        data: { userId: user.id, promptId },
      }),
      prisma.prompt.update({
        where: { id: promptId },
        data: { views: { increment: 1 } },
      }),
    ]);
    return;
  }

  await prisma.prompt.update({
    where: { id: promptId },
    data: { views: { increment: 1 } },
  });
}

export async function getSellerReviews(clerkUserId: string) {
  return safeDbRead([], async () => {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) return [];

    const reviews = await prisma.review.findMany({
      where: { prompt: { sellerId: user.id } },
      include: {
        user: { select: { username: true } },
        prompt: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      buyerUsername: review.user.username,
      promptId: review.prompt.id,
      promptTitle: review.prompt.title,
    }));
  });
}

export async function getSellerPrompts(clerkUserId: string) {
  return safeDbRead([], async () => {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) return [];

    const prompts = await prisma.prompt.findMany({
      where: { sellerId: user.id },
      include: {
        category: true,
        reviews: { select: { rating: true } },
        _count: { select: { purchases: true, reviews: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return prompts.map((prompt) => {
      const ratings = prompt.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;

      return {
        id: prompt.id,
        title: prompt.title,
        category: prompt.category.name,
        price: prompt.price,
        status: prompt.status as PromptStatus,
        sales: prompt._count.purchases,
        rating: Math.round(avgRating * 10) / 10,
        updatedAt: prompt.updatedAt.toISOString(),
      };
    });
  });
}

export async function getReviewPrompts() {
  return safeDbRead([], async () => {
    const prompts = await prisma.prompt.findMany({
      where: { status: "review" },
      include: {
        category: true,
        seller: { include: { sellerProfile: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { updatedAt: "asc" },
    });

    return prompts.map((prompt) => ({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      preview: prompt.preview,
      price: prompt.price,
      category: prompt.category.name,
      seller:
        prompt.seller.sellerProfile?.displayName ?? prompt.seller.username,
      sellerEmail: prompt.seller.email,
      tags: prompt.tags.map((t) => t.tag.name),
      updatedAt: prompt.updatedAt.toISOString(),
    }));
  });
}

export async function getSellerSales(clerkUserId: string) {
  return safeDbRead([], async () => {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) return [];

    const purchases = await prisma.purchase.findMany({
      where: { prompt: { sellerId: user.id } },
      include: {
        prompt: { select: { title: true } },
        buyer: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return purchases.map((p) => ({
      id: p.id,
      promptTitle: p.prompt.title,
      buyer: maskUsername(p.buyer.username),
      amount: p.amount,
      isFree: p.amount <= 0,
      date: p.createdAt.toISOString(),
      status: p.status as PurchaseStatus,
    }));
  });
}

function maskUsername(username: string) {
  if (username.length <= 3) return `${username}***`;
  return `${username.slice(0, 3)}***`;
}

const EMPTY_SELLER_OVERVIEW_STATS = {
  totalSales: 0,
  freeDownloads: 0,
  activePrompts: 0,
  avgRating: 0,
  totalEarnings: 0,
} as const;

const EMPTY_SELLER_ANALYTICS = {
  totalViews: 0,
  conversionRate: 0,
  avgOrderValue: 0,
  repeatBuyersPct: 0,
  topPrompts: [] as { title: string; views: number; sales: number; revenue: number }[],
  weeklyViews: [] as { label: string; value: number }[],
};

const EMPTY_SELLER_EARNINGS = {
  availableBalance: 0,
  pending: 0,
  lifetimeEarnings: 0,
  payouts: [] as {
    id: string;
    amount: number;
    date: string;
    status: "processing" | "paid";
    method: string;
  }[],
};

export async function getSellerOverviewStats(clerkUserId: string) {
  return safeDbRead(EMPTY_SELLER_OVERVIEW_STATS, async () => {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) {
      return EMPTY_SELLER_OVERVIEW_STATS;
    }

    const [completedPurchases, activePrompts, reviews, paidSalesCount, freeDownloads] =
      await Promise.all([
        prisma.purchase.findMany({
          where: {
            prompt: { sellerId: user.id },
            status: "completed",
            amount: { gt: 0 },
          },
          select: { amount: true },
        }),
        prisma.prompt.count({
          where: { sellerId: user.id, status: "published" },
        }),
        prisma.review.findMany({
          where: { prompt: { sellerId: user.id } },
          select: { rating: true },
        }),
        prisma.purchase.count({
          where: {
            prompt: { sellerId: user.id },
            status: "completed",
            amount: { gt: 0 },
          },
        }),
        prisma.purchase.count({
          where: {
            prompt: { sellerId: user.id },
            status: "completed",
            amount: { lte: 0 },
          },
        }),
      ]);

    const totalEarnings = completedPurchases.reduce(
      (sum, p) => sum + p.amount,
      0,
    );
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      totalSales: paidSalesCount,
      freeDownloads,
      activePrompts,
      avgRating: Math.round(avgRating * 10) / 10,
      totalEarnings,
    };
  });
}

export async function getSellerAnalytics(clerkUserId: string) {
  return safeDbRead(EMPTY_SELLER_ANALYTICS, async () => {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) {
      return EMPTY_SELLER_ANALYTICS;
    }

    const prompts = await prisma.prompt.findMany({
      where: { sellerId: user.id },
      include: {
        purchases: {
          where: { status: "completed" },
          select: { amount: true, buyerId: true },
        },
      },
    });

    const totalViews = prompts.reduce((sum, p) => sum + p.views, 0);
    const completedSales = prompts.flatMap((p) => p.purchases);
    const totalSales = completedSales.length;
    const totalRevenue = completedSales.reduce((sum, p) => sum + p.amount, 0);
    const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    const buyerCounts = new Map<string, number>();
    for (const sale of completedSales) {
      buyerCounts.set(sale.buyerId, (buyerCounts.get(sale.buyerId) ?? 0) + 1);
    }
    const repeatBuyers = [...buyerCounts.values()].filter((c) => c > 1).length;
    const repeatBuyersPct =
      buyerCounts.size > 0 ? (repeatBuyers / buyerCounts.size) * 100 : 0;

    const topPrompts = prompts
      .map((p) => ({
        title: p.title,
        views: p.views,
        sales: p.purchases.length,
        revenue: p.purchases.reduce((sum, s) => sum + s.amount, 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyBase = Math.max(Math.floor(totalViews / 7), 1);
    const weeklyViews = dayLabels.map((label, i) => ({
      label,
      value: Math.round(dailyBase * (0.7 + (i % 3) * 0.15)),
    }));

    return {
      totalViews,
      conversionRate: Math.round(conversionRate * 10) / 10,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      repeatBuyersPct: Math.round(repeatBuyersPct),
      topPrompts,
      weeklyViews,
    };
  });
}

export async function getSellerEarnings(clerkUserId: string) {
  return safeDbRead(EMPTY_SELLER_EARNINGS, async () => {
    const user = await prisma.user.findUnique({ where: { clerkUserId } });
    if (!user) {
      return EMPTY_SELLER_EARNINGS;
    }

    const purchases = await prisma.purchase.findMany({
      where: { prompt: { sellerId: user.id } },
      orderBy: { createdAt: "desc" },
    });

    const completed = purchases.filter((p) => p.status === "completed");
    const pending = purchases.filter((p) => p.status === "pending");

    const lifetimeEarnings = completed.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = pending.reduce((sum, p) => sum + p.amount, 0);
    const availableBalance = lifetimeEarnings * 0.85;

    const payouts = completed.slice(0, 4).map((p, i) => ({
      id: p.id,
      amount: p.amount * 0.85,
      date: p.createdAt.toISOString(),
      status: i === 0 && pendingAmount > 0 ? ("processing" as const) : ("paid" as const),
      method: i % 2 === 0 ? "PayPal" : "Bank Transfer",
    }));

    return {
      availableBalance,
      pending: pendingAmount,
      lifetimeEarnings,
      payouts,
    };
  });
}

export async function getCategoriesFromDb() {
  return safeDbRead([], () =>
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  );
}

export { formatCurrency, formatDate, formatPurchaseAmount } from "@/lib/format";
