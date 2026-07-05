"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { syncClerkUser } from "@/lib/user";

export async function dismissOnboarding(): Promise<void> {
  const user = await currentUser();
  if (!user) return;

  const dbUser = await syncClerkUser(user);
  if (!dbUser) return;

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { onboardingDismissedAt: new Date() },
  });

  revalidatePath("/buyer");
  revalidatePath("/dashboard");
}
