import type { User as ClerkUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { safeDbRead } from "@/lib/safe-db";
import type { UserProfile } from "@/types/user";

export const WELCOME_PACK_TITLE = "Welcome Pack - 10 Free AI Prompts";
const WELCOME_PACK_TITLE_PATTERN = /welcome\s*pack/i;

export type OnboardingStepId =
  | "welcomePack"
  | "firstPurchase"
  | "favorites"
  | "profile"
  | "seller";

export type OnboardingStep = {
  id: OnboardingStepId;
  label: string;
  completed: boolean;
  href: string;
};

export type OnboardingProgress = {
  steps: OnboardingStep[];
  completedCount: number;
  totalCount: number;
  allComplete: boolean;
  dismissed: boolean;
};

function isWelcomePackTitle(title: string): boolean {
  return WELCOME_PACK_TITLE_PATTERN.test(title);
}

function isProfileComplete(
  clerkUser: ClerkUser,
  sellerProfile: { bio: string | null; displayName: string } | null,
): boolean {
  const metadataProfile =
    (clerkUser.publicMetadata?.profile as UserProfile | undefined) ?? {};

  const hasClerkIdentity = Boolean(
    clerkUser.fullName?.trim() ||
      clerkUser.username?.trim() ||
      clerkUser.firstName?.trim(),
  );

  const hasMetadataProfile = Boolean(
    metadataProfile.username?.trim() || metadataProfile.bio?.trim(),
  );

  const hasSellerBio = Boolean(sellerProfile?.bio?.trim());

  return hasClerkIdentity || hasMetadataProfile || hasSellerBio;
}

export async function getOnboardingProgress(
  clerkUserId: string,
  clerkUser: ClerkUser,
): Promise<OnboardingProgress | null> {
  return safeDbRead(null, async () => {
    const [dbUser, welcomePackPrompt] = await Promise.all([
      prisma.user.findUnique({
        where: { clerkUserId },
        include: {
          sellerProfile: { select: { bio: true, displayName: true } },
          purchases: {
            where: { status: "completed" },
            select: {
              amount: true,
              prompt: { select: { id: true, title: true } },
            },
          },
          _count: { select: { wishlist: true } },
        },
      }),
      prisma.prompt.findFirst({
        where: {
          status: "published",
          title: { contains: "Welcome Pack", mode: "insensitive" },
        },
        select: { id: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    if (!dbUser) return null;

    const welcomePackPurchased = dbUser.purchases.some((purchase) =>
      isWelcomePackTitle(purchase.prompt.title),
    );
    const firstPaidPurchase = dbUser.purchases.some(
      (purchase) => purchase.amount > 0,
    );
    const favoritesComplete = dbUser._count.wishlist >= 3;
    const profileComplete = isProfileComplete(clerkUser, dbUser.sellerProfile);
    const sellerComplete =
      dbUser.role === "seller" || dbUser.sellerProfile !== null;

    const welcomePackHref = welcomePackPrompt
      ? `/prompts/${welcomePackPrompt.id}`
      : "/explore";

    const steps: OnboardingStep[] = [
      {
        id: "welcomePack",
        label: "Claim Welcome Pack",
        completed: welcomePackPurchased,
        href: welcomePackHref,
      },
      {
        id: "firstPurchase",
        label: "Buy first prompt",
        completed: firstPaidPurchase,
        href: "/explore",
      },
      {
        id: "favorites",
        label: "Favorite 3 prompts",
        completed: favoritesComplete,
        href: "/buyer/favorites",
      },
      {
        id: "profile",
        label: "Complete profile",
        completed: profileComplete,
        href: "/buyer/account",
      },
      {
        id: "seller",
        label: "Become a seller",
        completed: sellerComplete,
        href: "/#sell",
      },
    ];

    const completedCount = steps.filter((step) => step.completed).length;
    const totalCount = steps.length;
    const allComplete = completedCount === totalCount;
    const dismissed = dbUser.onboardingDismissedAt !== null;

    return {
      steps,
      completedCount,
      totalCount,
      allComplete,
      dismissed,
    };
  });
}
