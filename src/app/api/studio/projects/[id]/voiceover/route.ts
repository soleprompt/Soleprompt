import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  generateProjectVoiceover,
  getProjectVoiceoverState,
  regenerateProjectVoiceover,
} from "@/lib/studio/voiceover/generate";
import { syncCurrentUser } from "@/lib/user";

type RouteContext = {
  params: Promise<{ id: string }>;
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

  const { id } = await context.params;

  try {
    const voiceover = await getProjectVoiceoverState(id, dbUser.id);
    return NextResponse.json({ voiceover });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load voiceover.";
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

  let regenerate = false;
  try {
    const body = await request.json();
    if (body && typeof body === "object" && "regenerate" in body) {
      regenerate = body.regenerate === true;
    }
  } catch {
    // empty body is fine
  }

  const { id } = await context.params;

  try {
    const voiceover = regenerate
      ? await regenerateProjectVoiceover(id, dbUser.id)
      : await generateProjectVoiceover(id, dbUser.id);
    return NextResponse.json({ voiceover });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Voiceover generation failed.";

    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (
      message.includes("Script required") ||
      message.includes("not configured")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
