"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { resolveAdminAccess, syncClerkUser } from "@/lib/user";

export async function becomeSeller(): Promise<void> {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (await resolveAdminAccess()) {
    redirect("/admin");
  }

  const dbUser = await syncClerkUser(user);

  if (!dbUser) {
    redirect("/buyer");
  }

  if (dbUser.role === "admin") {
    redirect("/admin");
  }

  if (dbUser.role === "seller") {
    redirect("/seller");
  }

  const fields = {
    username: user.username ?? user.id.slice(0, 8),
    email: user.primaryEmailAddress?.emailAddress ?? "",
  };

  const updatedUser = await prisma.user.update({
    where: { clerkUserId: user.id },
    data: {
      ...fields,
      role: "seller",
    },
  });

  await prisma.sellerProfile.upsert({
    where: { userId: updatedUser.id },
    create: {
      userId: updatedUser.id,
      displayName: fields.username,
    },
    update: {
      displayName: fields.username,
    },
  });

  redirect("/seller");
}
