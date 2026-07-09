import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createMvpStudioProject, runFullMvpWorkflow } from "@/lib/studio/projects/mvp-workflow";
import { listStudioProjectsForUser } from "@/lib/studio/projects/data";
import { validateStudioGenerateInput } from "@/lib/studio/validation";
import { syncCurrentUser } from "@/lib/user";

export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await listStudioProjectsForUser(dbUser.id);
  return NextResponse.json({ projects });
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

  const validation = validateStudioGenerateInput(body);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const project = await createMvpStudioProject(dbUser.id, validation.data);

    void runFullMvpWorkflow(project.id, dbUser.id).catch(() => {
      // Failures are persisted on the project record.
    });

    return NextResponse.json(
      {
        project: {
          id: project.id,
          topic: project.topic,
          status: project.status,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create project." },
      { status: 500 },
    );
  }
}
