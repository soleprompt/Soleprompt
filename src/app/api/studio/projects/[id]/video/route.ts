import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getVideoProjectState } from "@/lib/studio/video/state";
import {
  enqueueVideoPipeline,
  runVideoStep,
} from "@/lib/studio/video/workflow";
import { VIDEO_STEPS, type VideoStep } from "@/lib/studio/video/types";
import { kickstartVideoPipeline } from "@/lib/studio/video/worker";
import { syncCurrentUser } from "@/lib/user";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isVideoStep(value: unknown): value is VideoStep {
  return typeof value === "string" && VIDEO_STEPS.includes(value as VideoStep);
}

export async function GET(_request: Request, context: RouteContext) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const video = await getVideoProjectState(id, dbUser.id);
    return NextResponse.json({ video });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load video state.";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
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

  let body: Record<string, unknown> = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
  } catch {
    // empty body ok
  }

  const { id } = await context.params;
  const inline = body.inline !== false;
  const voice = typeof body.voice === "string" ? body.voice : undefined;

  try {
    if (isVideoStep(body.step)) {
      const video = await runVideoStep(id, dbUser.id, body.step, {
        voice,
        regenerate: body.regenerate === true,
      });
      return NextResponse.json({ video });
    }

    await enqueueVideoPipeline(id, dbUser.id);

    if (inline) {
      void kickstartVideoPipeline(id, dbUser.id);
    }

    const video = await getVideoProjectState(id, dbUser.id);
    return NextResponse.json({ video, queued: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Video pipeline failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
