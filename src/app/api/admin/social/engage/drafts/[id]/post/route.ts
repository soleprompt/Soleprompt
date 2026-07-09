import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { canReplyNow } from "@/lib/social/reply-limits";
import { postReplyToX } from "@/lib/social/post-to-x";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteContext) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const draft = await prisma.engageReplyDraft.findUnique({
    where: { id },
    include: { post: true },
  });

  if (!draft) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  if (draft.status === "posted") {
    return NextResponse.json(
      { error: "This draft has already been posted." },
      { status: 400 },
    );
  }

  if (draft.status !== "approved") {
    return NextResponse.json(
      {
        error:
          "Only approved drafts can be posted. Approve the draft first.",
      },
      { status: 400 },
    );
  }

  const limits = await canReplyNow();
  if (!limits.allowed) {
    console.log("[X engage] Publish blocked by limits", {
      draftId: id,
      reason: limits.reason,
    });

    const updated = await prisma.engageReplyDraft.update({
      where: { id },
      data: {
        status: "approved",
        error: limits.reason,
      },
    });

    return NextResponse.json(
      {
        error: limits.reason,
        draft: updated,
        limitReached: true,
        nextAvailableAt: limits.nextAvailableAt?.toISOString() ?? null,
      },
      { status: 429 },
    );
  }

  console.log("[X engage] Manual publish requested", {
    draftId: id,
    targetTweetId: draft.post.xTweetId,
  });

  const result = await postReplyToX(draft.content, draft.post.xTweetId);

  if (result.ok) {
    const updated = await prisma.engageReplyDraft.update({
      where: { id },
      data: {
        status: "posted",
        postedAt: new Date(),
        xReplyId: result.postId,
        error: null,
      },
    });

    console.log("[X engage] Marked posted in database", {
      draftId: id,
      xReplyId: result.postId,
    });

    return NextResponse.json({ draft: updated });
  }

  console.error("[X engage] Publish failed", {
    draftId: id,
    error: result.error,
  });

  const updated = await prisma.engageReplyDraft.update({
    where: { id },
    data: {
      status: "failed",
      error: result.error,
    },
  });

  return NextResponse.json(
    { error: result.error, draft: updated },
    { status: 502 },
  );
}
