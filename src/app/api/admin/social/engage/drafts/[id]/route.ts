import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import type { SocialPostStatus } from "@/generated/prisma/client";

const VALID_STATUSES: SocialPostStatus[] = [
  "draft",
  "approved",
  "posted",
  "failed",
];

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    content?: string;
    status?: SocialPostStatus;
  };

  const existing = await prisma.engageReplyDraft.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  if (existing.status === "posted") {
    return NextResponse.json(
      { error: "Posted drafts cannot be edited." },
      { status: 400 },
    );
  }

  const data: {
    content?: string;
    status?: SocialPostStatus;
    error?: string | null;
  } = {};

  if (typeof body.content === "string") {
    const trimmed = body.content.trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "Content cannot be empty." },
        { status: 400 },
      );
    }
    if (trimmed.length > 280) {
      return NextResponse.json(
        { error: "Content exceeds 280 characters." },
        { status: 400 },
      );
    }
    data.content = trimmed;
  }

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    if (body.status === "approved") {
      await prisma.engageReplyDraft.updateMany({
        where: {
          postId: existing.postId,
          id: { not: id },
          status: { in: ["draft", "approved"] },
        },
        data: { status: "draft", error: null },
      });
    }

    data.status = body.status;
    if (body.status === "approved" || body.status === "draft") {
      data.error = null;
    }
  }

  const draft = await prisma.engageReplyDraft.update({
    where: { id },
    data,
  });

  return NextResponse.json({ draft });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.engageReplyDraft.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  if (existing.status === "posted") {
    return NextResponse.json(
      { error: "Posted drafts cannot be deleted." },
      { status: 400 },
    );
  }

  await prisma.engageReplyDraft.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
