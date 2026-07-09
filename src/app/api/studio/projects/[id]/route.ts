import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getStudioProjectForUser,
  getStudioProjectStatusForUser,
} from "@/lib/studio/projects/data";
import { syncCurrentUser } from "@/lib/user";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const url = new URL(request.url);
  const statusOnly = url.searchParams.get("status") === "1";

  if (statusOnly) {
    const status = await getStudioProjectStatusForUser(id, dbUser.id);
    if (!status) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json({ status });
  }

  const project = await getStudioProjectForUser(id, dbUser.id);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ project });
}
