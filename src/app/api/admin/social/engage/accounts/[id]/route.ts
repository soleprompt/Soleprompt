import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatDbReadError } from "@/lib/safe-db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { active?: boolean };

  try {
    const account = await prisma.engageTargetAccount.update({
      where: { id },
      data: {
        active: body.active,
      },
    });

    return NextResponse.json({ account });
  } catch (error) {
    return NextResponse.json(
      { error: formatDbReadError(error) },
      { status: 503 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.engageTargetAccount.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: formatDbReadError(error) },
      { status: 503 },
    );
  }
}
