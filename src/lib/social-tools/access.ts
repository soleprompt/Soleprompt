import { prisma } from "@/lib/db";
import { safeDbRead } from "@/lib/safe-db";
import { SOCIAL_SUITE_PRODUCT_TITLE } from "@/lib/social-tools/constants";

export async function hasSocialSuiteAccess(
  clerkUserId: string,
): Promise<boolean> {
  return safeDbRead(false, async () => {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return false;
    }

    const purchase = await prisma.purchase.findFirst({
      where: {
        buyerId: user.id,
        status: "completed",
        prompt: { title: SOCIAL_SUITE_PRODUCT_TITLE },
      },
      select: { id: true },
    });

    return Boolean(purchase);
  });
}

export async function getSocialSuiteProductId(): Promise<string | null> {
  return safeDbRead(null, async () => {
    const prompt = await prisma.prompt.findFirst({
      where: { title: SOCIAL_SUITE_PRODUCT_TITLE, status: "published" },
      select: { id: true },
    });
    return prompt?.id ?? null;
  });
}
