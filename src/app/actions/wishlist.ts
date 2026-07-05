"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { syncClerkUser } from "@/lib/user";

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
