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
  if (!dbUser) redirect("/buyer");
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
  const coverImageUrl = (formData.get("coverImageUrl") as string)?.trim() || null;
  const modelsRaw = formData.getAll("compatibleModels") as string[];

  if (!title || !description || !content || !categoryId || !priceRaw) {
    return { error: "Please fill in all required fields." };
  }

  const price = parseFloat(priceRaw);
  if (Number.isNaN(price) || price < 0) {
    return { error: "Please enter a valid price." };
  }

  const tags = parseTags(tagsRaw ?? "");

  const tagIds = await getOrCreateTags(tags);

  const preview =
    content.length > 180 ? `${content.slice(0, 177)}…` : content;
  const compatibleModels =
    modelsRaw.length > 0
      ? modelsRaw
      : ["ChatGPT", "Claude", "Gemini", "Cursor"];
  const sampleOutput = `Sample output for "${title}": structured results based on your inputs, ready to copy and deploy.`;

  const resolvedStatus =
    dbUser.role === "admin"
      ? status === "draft"
        ? "draft"
        : status
      : status === "draft"
        ? "draft"
        : "review";

  await prisma.prompt.create({
    data: {
      title,
      description,
      content,
      preview,
      compatibleModels,
      sampleOutput,
      coverImageUrl,
      price,
      status: resolvedStatus,
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
  const coverImageUrl = (formData.get("coverImageUrl") as string)?.trim() || null;
  const modelsRaw = formData.getAll("compatibleModels") as string[];

  if (!title || !description || !content || !categoryId || !priceRaw) {
    return { error: "Please fill in all required fields." };
  }

  const price = parseFloat(priceRaw);
  if (Number.isNaN(price) || price < 0) {
    return { error: "Please enter a valid price." };
  }

  const tags = parseTags(tagsRaw ?? "");
  const tagIds = await getOrCreateTags(tags);
  const compatibleModels =
    modelsRaw.length > 0
      ? modelsRaw
      : existing.compatibleModels;

  const resolvedStatus =
    dbUser.role === "admin"
      ? status || existing.status
      : status === "published"
        ? existing.status
        : status || existing.status;

  await prisma.promptTag.deleteMany({ where: { promptId } });

  await prisma.prompt.update({
    where: { id: promptId },
    data: {
      title,
      description,
      content,
      preview: content.length > 180 ? `${content.slice(0, 177)}…` : content,
      sampleOutput: existing.sampleOutput || `Sample output for "${title}".`,
      compatibleModels,
      coverImageUrl: coverImageUrl ?? existing.coverImageUrl,
      price,
      status: resolvedStatus,
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
