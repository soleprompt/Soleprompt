"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { syncClerkUser } from "@/lib/user";
import type { PromptStatus } from "@/generated/prisma/client";

export type PromptFormState = {
  error?: string;
  success?: boolean;
};

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5);
}

async function getSellerUser() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await syncClerkUser(user);
  if (dbUser.role !== "seller" && dbUser.role !== "admin") {
    redirect("/buyer");
  }

  return dbUser;
}

async function getOrCreateTags(names: string[]) {
  const tagIds: string[] = [];

  for (const name of names) {
    const tag = await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    tagIds.push(tag.id);
  }

  return tagIds;
}

export async function createPrompt(
  _prevState: PromptFormState,
  formData: FormData,
): Promise<PromptFormState> {
  const dbUser = await getSellerUser();

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const categoryId = formData.get("categoryId") as string;
  const priceRaw = formData.get("price") as string;
  const tagsRaw = formData.get("tags") as string;
  const status = (formData.get("status") as PromptStatus) || "review";

  if (!title || !description || !content || !categoryId || !priceRaw) {
    return { error: "Please fill in all required fields." };
  }

  const price = parseFloat(priceRaw);
  if (Number.isNaN(price) || price < 0) {
    return { error: "Please enter a valid price." };
  }

  const tags = parseTags(tagsRaw ?? "");

  const tagIds = await getOrCreateTags(tags);

  await prisma.prompt.create({
    data: {
      title,
      description,
      content,
      price,
      status: status === "draft" ? "draft" : "review",
      sellerId: dbUser.id,
      categoryId,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  revalidatePath("/seller/prompts");
  revalidatePath("/seller");
  redirect("/seller/prompts");
}

export async function updatePrompt(
  promptId: string,
  _prevState: PromptFormState,
  formData: FormData,
): Promise<PromptFormState> {
  const dbUser = await getSellerUser();

  const existing = await prisma.prompt.findFirst({
    where: { id: promptId, sellerId: dbUser.id },
  });

  if (!existing) {
    return { error: "Prompt not found." };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const categoryId = formData.get("categoryId") as string;
  const priceRaw = formData.get("price") as string;
  const tagsRaw = formData.get("tags") as string;
  const status = formData.get("status") as PromptStatus;

  if (!title || !description || !content || !categoryId || !priceRaw) {
    return { error: "Please fill in all required fields." };
  }

  const price = parseFloat(priceRaw);
  if (Number.isNaN(price) || price < 0) {
    return { error: "Please enter a valid price." };
  }

  const tags = parseTags(tagsRaw ?? "");
  const tagIds = await getOrCreateTags(tags);

  await prisma.promptTag.deleteMany({ where: { promptId } });

  await prisma.prompt.update({
    where: { id: promptId },
    data: {
      title,
      description,
      content,
      price,
      status: status || existing.status,
      categoryId,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  revalidatePath("/seller/prompts");
  revalidatePath(`/seller/prompts/${promptId}/edit`);
  redirect("/seller/prompts");
}

export async function deletePrompt(promptId: string): Promise<void> {
  const dbUser = await getSellerUser();

  const existing = await prisma.prompt.findFirst({
    where: { id: promptId, sellerId: dbUser.id },
  });

  if (!existing) return;

  await prisma.prompt.delete({ where: { id: promptId } });

  revalidatePath("/seller/prompts");
  revalidatePath("/seller");
}

export async function publishPrompt(promptId: string): Promise<void> {
  const dbUser = await getSellerUser();

  await prisma.prompt.updateMany({
    where: { id: promptId, sellerId: dbUser.id },
    data: { status: "published" },
  });

  revalidatePath("/seller/prompts");
}
