import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatDbReadError } from "@/lib/safe-db";

function normalizeUsername(username: string): string {
  return username.trim().replace(/^@/, "").toLowerCase();
}

export async function GET() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accounts = await prisma.engageTargetAccount.findMany({
      orderBy: [{ active: "desc" }, { username: "asc" }],
    });
    return NextResponse.json({ accounts });
  } catch (error) {
    return NextResponse.json(
      { error: formatDbReadError(error) },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { username?: string };
  const username = normalizeUsername(body.username ?? "");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required (e.g. OpenAI or @OpenAI)." },
      { status: 400 },
    );
  }

  if (!/^[a-z0-9_]{1,15}$/i.test(username)) {
    return NextResponse.json(
      { error: "Invalid X username format." },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.engageTargetAccount.findUnique({
      where: { username },
    });

    if (existing) {
      return NextResponse.json(
        { error: `@${username} is already a target account.` },
        { status: 409 },
      );
    }

    const account = await prisma.engageTargetAccount.create({
      data: { username },
    });

    return NextResponse.json({ account });
  } catch (error) {
    return NextResponse.json(
      { error: formatDbReadError(error) },
      { status: 503 },
    );
  }
}
