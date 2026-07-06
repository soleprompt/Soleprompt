"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { syncClerkUser } from "@/lib/user";

export async function submitReview(
  promptId: string,
  formData: FormData,
) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await syncClerkUser(user);
  if (!dbUser) return { error: "User not found" };

  const rating = Number(formData.get("rating"));
  const comment = (formData.get("comment") as string)?.trim() || null;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Please select a rating between 1 and 5." };
  }

  const purchased = await prisma.purchase.findFirst({
    where: {
      buyerId: dbUser.id,
      promptId,
      status: "completed",
    },
    select: { id: true },
  });

  if (!purchased) {
    return { error: "You can only review prompts you've purchased." };
  }

  await prisma.review.upsert({
    where: { promptId_userId: { promptId, userId: dbUser.id } },
    create: { promptId, userId: dbUser.id, rating, comment },
    update: { rating, comment },
  });

  revalidatePath(`/prompts/${promptId}`);
  revalidatePath("/seller/reviews");

  return { success: true };
}
