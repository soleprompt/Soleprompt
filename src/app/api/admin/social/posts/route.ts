import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import type { SocialPostStatus } from "@/generated/prisma/client";

export async function GET(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");

  const status =
    statusParam && statusParam !== "all"
      ? (statusParam as SocialPostStatus)
      : undefined;

  const posts = await prisma.socialPost.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ posts });
}
