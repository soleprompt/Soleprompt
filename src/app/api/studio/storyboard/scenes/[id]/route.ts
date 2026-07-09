import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { updateStoryboardScene } from "@/lib/studio/storyboard/data";
import { validateStoryboardSceneUpdate } from "@/lib/studio/storyboard/validation";
import { syncCurrentUser } from "@/lib/user";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validateStoryboardSceneUpdate(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { id } = await context.params;
  const scene = await updateStoryboardScene(id, dbUser.id, validation.data);

  if (!scene) {
    return NextResponse.json({ error: "Scene not found." }, { status: 404 });
  }

  return NextResponse.json({ scene });
}
