import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateSceneImage } from "@/lib/studio/video/scene-images";
import { getSceneImagePath, readProjectFile } from "@/lib/studio/video/storage";
import { syncCurrentUser } from "@/lib/user";

type RouteContext = {
  params: Promise<{ id: string; sceneId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, sceneId } = await context.params;
  const filePath = getSceneImagePath(id, sceneId);
  const buffer = await readProjectFile(filePath);

  if (!buffer) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

export async function POST(_request: Request, context: RouteContext) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, sceneId } = await context.params;

  try {
    const asset = await generateSceneImage(id, dbUser.id, sceneId);
    return NextResponse.json({ asset });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image generation failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
