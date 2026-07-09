import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listStoryboardScenesForProject } from "@/lib/studio/storyboard/data";
import { runStoryboardEngine } from "@/lib/studio/storyboard/run";
import { validateStoryboardInput } from "@/lib/studio/storyboard/validation";
import { syncCurrentUser } from "@/lib/user";

export async function GET(request: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = new URL(request.url).searchParams.get("projectId")?.trim();
  if (!projectId) {
    return NextResponse.json({ error: "projectId query param is required." }, { status: 400 });
  }

  const scenes = await listStoryboardScenesForProject(projectId, dbUser.id);
  return NextResponse.json({ scenes });
}

export async function POST(request: Request) {
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

  const validation = validateStoryboardInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const result = await runStoryboardEngine(validation.data.projectId, dbUser.id);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Storyboard generation failed.";

    if (message.includes("OPENAI_API_KEY")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    if (message.includes("not found") || message.includes("Script not found")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
