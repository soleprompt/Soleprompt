import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { isSocialAutoApproveEnabled } from "@/lib/social/auto-social-config";
import { pickRandomTemplates } from "@/lib/social/tweet-templates";

export async function POST() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = pickRandomTemplates(1);
  const autoApprove = isSocialAutoApproveEnabled();

  const posts = await prisma.$transaction(
    templates.map((content) =>
      prisma.socialPost.create({
        data: { content, status: autoApprove ? "approved" : "draft" },
      }),
    ),
  );

  return NextResponse.json({
    posts,
    count: posts.length,
    autoApproved: autoApprove,
  });
}
