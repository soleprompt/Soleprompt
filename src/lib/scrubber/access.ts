import { prisma } from "@/lib/db";
import { safeDbRead } from "@/lib/safe-db";
import { X_SCRUBBER_PRODUCT_TITLE } from "@/lib/scrubber/constants";

export async function hasScrubberAccess(
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
        prompt: { title: X_SCRUBBER_PRODUCT_TITLE },
      },
      select: { id: true },
    });

    return Boolean(purchase);
  });
}

export async function getScrubberProductId(): Promise<string | null> {
  return safeDbRead(null, async () => {
    const prompt = await prisma.prompt.findFirst({
      where: { title: X_SCRUBBER_PRODUCT_TITLE, status: "published" },
      select: { id: true },
    });
    return prompt?.id ?? null;
  });
}
