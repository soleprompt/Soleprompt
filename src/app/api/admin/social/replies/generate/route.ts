import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { parseTweetInput } from "@/lib/social/parse-tweet-url";
import {
  createBatchId,
  generateFiveReplies,
  summarizePost,
} from "@/lib/social/reply-generator";
import type { ReplyCategory } from "@/lib/social/reply-templates";
import { isSocialAutoApproveEnabled } from "@/lib/social/auto-social-config";
import { pickBestReplyOption } from "@/lib/social/auto-select";
import {
  detectCategoryFromText,
  REPLY_CATEGORIES,
} from "@/lib/social/reply-templates";

const VALID_CATEGORIES = new Set(REPLY_CATEGORIES.map((c) => c.id));

export async function POST(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    tweetUrl?: string;
    targetSnippet?: string;
    targetAuthor?: string;
    category?: ReplyCategory;
  };

  if (!body.tweetUrl?.trim()) {
    return NextResponse.json(
      { error: "Tweet URL or ID is required." },
      { status: 400 },
    );
  }

  const parsed = parseTweetInput(body.tweetUrl);
  if (!parsed) {
    return NextResponse.json(
      {
        error:
          "Invalid tweet URL or ID. Use an x.com/twitter.com status link or numeric tweet ID.",
      },
      { status: 400 },
    );
  }

  const activeReply = await prisma.socialReply.findFirst({
    where: {
      targetTweetId: parsed.tweetId,
      status: { in: ["approved", "scheduled", "posted"] },
    },
  });

  if (activeReply) {
    return NextResponse.json(
      {
        error: "A reply is already approved, scheduled, or posted for this tweet.",
        reply: activeReply,
      },
      { status: 409 },
    );
  }

  const pendingBatch = await prisma.socialReply.findFirst({
    where: {
      targetTweetId: parsed.tweetId,
      parentBatchId: { not: null },
      status: "draft",
    },
  });

  if (pendingBatch) {
    return NextResponse.json(
      {
        error:
          "Reply options already generated for this tweet. Pick one from the batch below or delete them first.",
        batchId: pendingBatch.parentBatchId,
      },
      { status: 409 },
    );
  }

  const snippet = body.targetSnippet?.trim() || null;
  const author =
    body.targetAuthor?.trim() || parsed.authorHandle || null;

  let category: ReplyCategory = "ai-prompts";
  if (body.category && VALID_CATEGORIES.has(body.category)) {
    category = body.category;
  } else if (snippet) {
    category = detectCategoryFromText(snippet);
  }

  const usedTaglines = await prisma.socialReply.findMany({
    where: {
      taglineKey: { not: null },
      status: { in: ["posted", "approved", "scheduled"] },
    },
    select: { taglineKey: true },
  });

  const usedTaglineKeys = new Set(
    usedTaglines
      .map((row) => row.taglineKey)
      .filter((key): key is string => Boolean(key)),
  );

  const summary = summarizePost(snippet, author);
  const options = generateFiveReplies(snippet ?? "", category, {
    author,
    usedTaglineKeys,
  });

  const tooLong = options.find((o) => o.content.length > 280);
  if (tooLong) {
    return NextResponse.json(
      { error: "Generated reply exceeds 280 characters." },
      { status: 422 },
    );
  }

  const autoApprove = isSocialAutoApproveEnabled();

  if (autoApprove) {
    const best = pickBestReplyOption(
      options.map((option) => ({ ...option, replyStyle: option.style })),
    );

    const reply = await prisma.socialReply.create({
      data: {
        targetTweetId: parsed.tweetId,
        targetTweetUrl: parsed.tweetUrl,
        targetAuthor: author,
        targetSnippet: snippet,
        postSummary: summary,
        replyStyle: best.style,
        content: best.content,
        status: "approved",
        includesLink: best.includesLink,
        taglineKey: best.taglineKey,
      },
    });

    return NextResponse.json({
      summary,
      category,
      autoApproved: true,
      options: [
        {
          id: reply.id,
          style: reply.replyStyle,
          content: reply.content,
          includesLink: reply.includesLink,
        },
      ],
      replies: [reply],
    });
  }

  const parentBatchId = createBatchId();

  const replies = await prisma.$transaction(
    options.map((option) =>
      prisma.socialReply.create({
        data: {
          targetTweetId: parsed.tweetId,
          targetTweetUrl: parsed.tweetUrl,
          targetAuthor: author,
          targetSnippet: snippet,
          postSummary: summary,
          replyStyle: option.style,
          parentBatchId,
          content: option.content,
          status: "draft",
          includesLink: option.includesLink,
          taglineKey: option.taglineKey,
        },
      }),
    ),
  );

  return NextResponse.json({
    summary,
    category,
    batchId: parentBatchId,
    options: replies.map((reply) => ({
      id: reply.id,
      style: reply.replyStyle,
      content: reply.content,
      includesLink: reply.includesLink,
    })),
    replies,
  });
}
