"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import type { PromptStatus } from "@/generated/prisma/client";

async function updatePromptReviewStatus(
  promptId: string,
  status: Extract<PromptStatus, "published" | "rejected">,
) {
  await requireAdmin();

  const prompt = await prisma.prompt.findFirst({
    where: { id: promptId, status: "review" },
  });

  if (!prompt) return;

  await prisma.prompt.update({
    where: { id: promptId },
    data: { status },
  });

  revalidatePath("/admin/prompts");
  revalidatePath("/seller/prompts");
  revalidatePath("/explore");
  revalidatePath("/search");
  revalidatePath(`/prompts/${promptId}`);
}

export async function approvePrompt(promptId: string): Promise<void> {
  await updatePromptReviewStatus(promptId, "published");
}

export async function rejectPrompt(promptId: string): Promise<void> {
  await updatePromptReviewStatus(promptId, "rejected");
}
