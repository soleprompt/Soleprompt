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

  const reply = await prisma.socialReply.findUnique({ where: { id } });
  if (!reply) {
    return NextResponse.json({ error: "Reply not found" }, { status: 404 });
  }

  if (reply.status === "posted") {
    return NextResponse.json(
      { error: "This reply has already been posted." },
      { status: 400 },
    );
  }

  if (reply.status !== "approved" && reply.status !== "scheduled") {
    return NextResponse.json(
      {
        error:
          "Only approved or scheduled replies can be posted. Approve the draft first.",
      },
      { status: 400 },
    );
  }

  const limits = await canReplyNow();
  if (!limits.allowed) {
    console.log("[X reply] Manual publish blocked by limits", {
      replyId: id,
      reason: limits.reason,
    });

    const updated = await prisma.socialReply.update({
      where: { id },
      data: {
        status: "scheduled",
        error: limits.reason,
        scheduledAt: limits.nextAvailableAt ?? reply.scheduledAt,
      },
    });

    return NextResponse.json(
      {
        error: limits.reason,
        reply: updated,
        limitReached: true,
        nextAvailableAt: limits.nextAvailableAt?.toISOString() ?? null,
      },
      { status: 429 },
    );
  }

  console.log("[X reply] Manual publish requested", {
    replyId: id,
    targetTweetId: reply.targetTweetId,
  });

  const result = await postReplyToX(reply.content, reply.targetTweetId);

  if (result.ok) {
    const updated = await prisma.socialReply.update({
      where: { id },
      data: {
        status: "posted",
        postedAt: new Date(),
        xReplyId: result.postId,
        error: null,
      },
    });
    console.log("[X reply] Marked posted in database", {
      replyId: id,
      xReplyId: result.postId,
    });
    return NextResponse.json({ reply: updated });
  }

  console.error("[X reply] Publish failed", {
    replyId: id,
    error: result.error,
  });

  const updated = await prisma.socialReply.update({
    where: { id },
    data: {
      status: "failed",
      error: result.error,
    },
  });

  return NextResponse.json(
    { error: result.error, reply: updated },
    { status: 502 },
  );
}
