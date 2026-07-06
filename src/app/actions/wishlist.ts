"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { syncClerkUser } from "@/lib/user";

export async function toggleWishlist(promptId: string) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await syncClerkUser(user);
  if (!dbUser) return { error: "User not found" };

  const existing = await prisma.wishlist.findUnique({
    where: { userId_promptId: { userId: dbUser.id, promptId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlist.create({
      data: { userId: dbUser.id, promptId },
    });
  }

  revalidatePath("/buyer/favorites");
  revalidatePath("/buyer/wishlist");
  revalidatePath(`/prompts/${promptId}`);

  return { saved: !existing };
}

export async function removeFromWishlist(wishlistId: string) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await syncClerkUser(user);
  if (!dbUser) return;

  await prisma.wishlist.deleteMany({
    where: { id: wishlistId, userId: dbUser.id },
  });

  revalidatePath("/buyer/favorites");
  revalidatePath("/buyer/wishlist");
}
