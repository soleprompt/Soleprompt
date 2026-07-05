"use server";

import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/audit";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { syncCurrentUser } from "@/lib/user";
import type { PromptStatus } from "@/generated/prisma/client";

async function updatePromptReviewStatus(
  promptId: string,
  status: Extract<PromptStatus, "published" | "rejected">,
) {
  const admin = await syncCurrentUser();
  await requireAdmin();

  const prompt = await prisma.prompt.findFirst({
    where: { id: promptId, status: "review" },
    select: { id: true, title: true },
  });

  if (!prompt) return;

  await prisma.prompt.update({
    where: { id: promptId },
    data: { status },
  });

  await createAuditLog({
    action: status === "published" ? "prompt.approved" : "prompt.rejected",
    actorId: admin?.id ?? null,
    entityType: "prompt",
    entityId: promptId,
    metadata: { title: prompt.title, status },
  });

  revalidatePath("/admin");
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
