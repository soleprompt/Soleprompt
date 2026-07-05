import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { parseTweetInput } from "@/lib/social/parse-tweet-url";
import type { ReplyCategory } from "@/lib/social/reply-templates";
import {
  detectCategoryFromText,
  pickReplyTemplate,
  renderReplyTemplate,
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
      { error: "Invalid tweet URL or ID. Use an x.com/twitter.com status link or numeric tweet ID." },
      { status: 400 },
    );
  }

  const existing = await prisma.socialReply.findFirst({
    where: {
      targetTweetId: parsed.tweetId,
      status: { in: ["draft", "approved", "scheduled", "posted"] },
    },
  });

  if (existing) {
    return NextResponse.json(
      {
        error: "A reply draft already exists for this tweet.",
        reply: existing,
      },
      { status: 409 },
    );
  }

  const snippet = body.targetSnippet?.trim() || null;
  const author =
    body.targetAuthor?.trim() ||
    parsed.authorHandle ||
    null;

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

  const template = pickReplyTemplate(category, usedTaglineKeys);
  if (!template) {
    return NextResponse.json(
      {
        error:
          "All reply templates for this category have been used recently. Try another category or edit an existing draft.",
      },
      { status: 422 },
    );
  }

  const content = renderReplyTemplate(template);

  if (content.length > 280) {
    return NextResponse.json(
      { error: "Generated reply exceeds 280 characters." },
      { status: 422 },
    );
  }

  const reply = await prisma.socialReply.create({
    data: {
      targetTweetId: parsed.tweetId,
      targetTweetUrl: parsed.tweetUrl,
      targetAuthor: author,
      targetSnippet: snippet,
      content,
      status: "draft",
      includesLink: template.includesLink,
      taglineKey: template.taglineKey,
    },
  });

  return NextResponse.json({ reply, category });
}
