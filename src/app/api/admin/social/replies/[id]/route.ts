import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import type { SocialPostStatus } from "@/generated/prisma/client";

const VALID_STATUSES: SocialPostStatus[] = [
  "draft",
  "approved",
  "scheduled",
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
    scheduledAt?: string | null;
  };

  const existing = await prisma.socialReply.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Reply not found" }, { status: 404 });
  }

  if (existing.status === "posted") {
    return NextResponse.json(
      { error: "Posted replies cannot be edited." },
      { status: 400 },
    );
  }

  const data: {
    content?: string;
    status?: SocialPostStatus;
    scheduledAt?: Date | null;
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
    data.status = body.status;
  }

  if (body.scheduledAt !== undefined) {
    if (body.scheduledAt === null) {
      data.scheduledAt = null;
    } else {
      const scheduledAt = new Date(body.scheduledAt);
      if (Number.isNaN(scheduledAt.getTime())) {
        return NextResponse.json(
          { error: "Invalid scheduledAt date." },
          { status: 400 },
        );
      }
      data.scheduledAt = scheduledAt;
      data.status = "scheduled";
      data.error = null;
    }
  }

  const reply = await prisma.socialReply.update({
    where: { id },
    data,
  });

  return NextResponse.json({ reply });
}
