import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { MVP_STEPS, type MvpStep } from "@/lib/studio/projects/mvp-types";
import { runMvpStep } from "@/lib/studio/projects/mvp-workflow";
import { getMvpProjectState } from "@/lib/studio/projects/mvp-workflow";
import { syncCurrentUser } from "@/lib/user";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isMvpStep(value: unknown): value is MvpStep {
  return typeof value === "string" && MVP_STEPS.includes(value as MvpStep);
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  if (!isMvpStep(record.step)) {
    return NextResponse.json(
      { error: "step must be research, script, storyboard, thumbnail, or seo." },
      { status: 400 },
    );
  }

  const { id } = await context.params;

  try {
    await runMvpStep(id, dbUser.id, record.step);
    const mvp = await getMvpProjectState(id, dbUser.id);
    return NextResponse.json({ mvp });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Regeneration failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
