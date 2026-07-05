import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { pickRandomTemplates } from "@/lib/social/tweet-templates";

export async function POST() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = pickRandomTemplates(1);

  const posts = await prisma.$transaction(
    templates.map((content) =>
      prisma.socialPost.create({
        data: { content, status: "draft" },
      }),
    ),
  );

  return NextResponse.json({ posts, count: posts.length });
}
