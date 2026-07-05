import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteContext) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const selected = await prisma.socialReply.findUnique({ where: { id } });
  if (!selected) {
    return NextResponse.json({ error: "Reply not found" }, { status: 404 });
  }

  if (!selected.parentBatchId) {
    return NextResponse.json({ reply: selected });
  }

  if (selected.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft options can be selected from a batch." },
      { status: 400 },
    );
  }

  const batchId = selected.parentBatchId;

  const reply = await prisma.$transaction(async (tx) => {
    await tx.socialReply.deleteMany({
      where: {
        parentBatchId: batchId,
        id: { not: id },
      },
    });

    return tx.socialReply.update({
      where: { id },
      data: { parentBatchId: null },
    });
  });

  return NextResponse.json({ reply });
}
