import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildExportPackage } from "@/lib/studio/video/export";
import { getExportZipPath, readProjectFile } from "@/lib/studio/video/storage";
import { syncCurrentUser } from "@/lib/user";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
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
    const exportUrl = await buildExportPackage(id, dbUser.id);
    return NextResponse.json({ exportUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Export failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
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

  const project = await prisma.studioProject.findFirst({
    where: { id, userId: dbUser.id },
    select: { topic: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const buffer = await readProjectFile(getExportZipPath(id));
  if (!buffer) {
    return NextResponse.json(
      { error: "Export package not found. POST to generate first." },
      { status: 404 },
    );
  }

  const slug = project.topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${slug}-export.zip"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
