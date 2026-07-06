import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatDbReadError } from "@/lib/safe-db";
import type { SocialPostStatus } from "@/generated/prisma/client";

export async function GET(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const draftStatus =
    status && status !== "all" ? (status as SocialPostStatus) : undefined;

  try {
    const posts = await prisma.engagePost.findMany({
      where: draftStatus
        ? { drafts: { some: { status: draftStatus } } }
        : undefined,
      include: {
        drafts: { orderBy: { createdAt: "asc" } },
        targetAccount: true,
      },
      orderBy: [{ relevanceScore: "desc" }, { tweetedAt: "desc" }],
      take: 100,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json(
      { error: formatDbReadError(error) },
      { status: 503 },
    );
  }
}
