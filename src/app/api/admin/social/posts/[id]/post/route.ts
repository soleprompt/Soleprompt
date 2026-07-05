import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { postToX } from "@/lib/social/post-to-x";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteContext) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const post = await prisma.socialPost.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.status === "posted") {
    return NextResponse.json(
      { error: "This post has already been published." },
      { status: 400 },
    );
  }

  const result = await postToX(post.content);

  if (result.ok) {
    const updated = await prisma.socialPost.update({
      where: { id },
      data: {
        status: "posted",
        postedAt: new Date(),
        xPostId: result.postId,
        error: null,
      },
    });
    return NextResponse.json({ post: updated });
  }

  const updated = await prisma.socialPost.update({
    where: { id },
    data: {
      status: "failed",
      error: result.error,
    },
  });

  return NextResponse.json(
    { error: result.error, post: updated },
    { status: 502 },
  );
}
