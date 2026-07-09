import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getVideoProjectState } from "@/lib/studio/video/state";
import { runVideoStep } from "@/lib/studio/video/workflow";
import { VIDEO_STEPS, type VideoStep } from "@/lib/studio/video/types";
import { syncCurrentUser } from "@/lib/user";

type RouteContext = {
  params: Promise<{ id: string; step: string }>;
};

function isVideoStep(value: string): value is VideoStep {
  return VIDEO_STEPS.includes(value as VideoStep);
}

export async function POST(request: Request, context: RouteContext) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, step } = await context.params;
  if (!isVideoStep(step)) {
    return NextResponse.json({ error: "Invalid video step." }, { status: 400 });
  }

  let body: Record<string, unknown> = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
  } catch {
    // empty ok
  }

  try {
    const video = await runVideoStep(id, dbUser.id, step, {
      voice: typeof body.voice === "string" ? body.voice : undefined,
      regenerate: body.regenerate === true,
    });
    return NextResponse.json({ video });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Video step failed.";
    const video = await getVideoProjectState(id, dbUser.id).catch(() => null);
    return NextResponse.json({ error: message, video }, { status: 502 });
  }
}
