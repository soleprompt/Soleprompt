import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSrtPath, readProjectFile } from "@/lib/studio/video/storage";
import { syncCurrentUser } from "@/lib/user";
import { prisma } from "@/lib/db";

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

  const project = await prisma.studioProject.findFirst({
    where: { id, userId: dbUser.id },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const buffer = await readProjectFile(getSrtPath(id));
  if (!buffer) {
    return NextResponse.json({ error: "Captions not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/x-subrip",
      "Content-Disposition": 'attachment; filename="captions.srt"',
      "Cache-Control": "private, max-age=3600",
    },
  });
}
