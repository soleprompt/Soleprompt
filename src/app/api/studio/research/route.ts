import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runStudioResearch } from "@/lib/studio/research/run";
import { validateStudioResearchInput } from "@/lib/studio/research/validation";
import { syncCurrentUser } from "@/lib/user";

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

  const validation = validateStudioResearchInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { projectId, ...input } = validation.data;

  if (projectId) {
    const project = await prisma.studioProject.findFirst({
      where: { id: projectId, userId: dbUser.id },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
  }

  try {
    const research = await runStudioResearch({
      userId: dbUser.id,
      input,
      projectId,
    });

    return NextResponse.json({ research }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Research generation failed.";

    if (message.includes("OPENAI_API_KEY")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
