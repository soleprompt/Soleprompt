import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatDbReadError } from "@/lib/safe-db";
import { generateEngageDrafts } from "@/lib/social/engage-draft-generator";
import type { EngageTopicId } from "@/lib/social/engage-topics";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteContext) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const post = await prisma.engagePost.findUnique({
      where: { id },
      include: { drafts: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const activeDraft = post.drafts.find((d) =>
      ["approved", "posted"].includes(d.status),
    );
    if (activeDraft) {
      return NextResponse.json(
        {
          error:
            "This post already has an approved or posted reply. Delete drafts first to regenerate.",
        },
        { status: 409 },
      );
    }

    if (post.drafts.length > 0) {
      return NextResponse.json(
        {
          error:
            "Drafts already exist for this post. Edit or delete them first.",
        },
        { status: 409 },
      );
    }

    const usedTaglines = await prisma.engageReplyDraft.findMany({
      where: {
        taglineKey: { not: null },
        status: { in: ["posted", "approved"] },
      },
      select: { taglineKey: true },
    });

    const usedTaglineKeys = new Set(
      usedTaglines
        .map((row) => row.taglineKey)
        .filter((key): key is string => Boolean(key)),
    );

    const options = generateEngageDrafts(post.tweetText, {
      author: post.authorUsername,
      matchedTopics: post.matchedTopics as EngageTopicId[],
      usedTaglineKeys,
    });

    const tooLong = options.find((o) => o.content.length > 280);
    if (tooLong) {
      return NextResponse.json(
        { error: "Generated draft exceeds 280 characters." },
        { status: 422 },
      );
    }

    const drafts = await prisma.$transaction(
      options.map((option) =>
        prisma.engageReplyDraft.create({
          data: {
            postId: post.id,
            style: option.style,
            content: option.content,
            status: "draft",
            includesLink: option.includesLink,
            taglineKey: option.taglineKey,
          },
        }),
      ),
    );

    return NextResponse.json({ drafts, postId: post.id });
  } catch (error) {
    return NextResponse.json(
      { error: formatDbReadError(error) },
      { status: 503 },
    );
  }
}
