import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import {
  applyImprovement,
  IMPROVEMENT_OPTIONS,
  type ImprovementType,
} from "@/lib/social/reply-improvements";

const VALID_IMPROVEMENTS = new Set<ImprovementType>(
  IMPROVEMENT_OPTIONS.map((o) => o.id),
);

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { improvement?: ImprovementType };

  if (!body.improvement || !VALID_IMPROVEMENTS.has(body.improvement)) {
    return NextResponse.json(
      { error: "Invalid improvement type." },
      { status: 400 },
    );
  }

  const existing = await prisma.socialReply.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Reply not found" }, { status: 404 });
  }

  if (existing.status === "posted") {
    return NextResponse.json(
      { error: "Posted replies cannot be edited." },
      { status: 400 },
    );
  }

  const improved = applyImprovement(existing.content, body.improvement);
  if (!improved.trim()) {
    return NextResponse.json(
      { error: "Improvement produced empty content." },
      { status: 422 },
    );
  }

  if (improved.length > 280) {
    return NextResponse.json(
      { error: "Improved reply exceeds 280 characters." },
      { status: 422 },
    );
  }

  const includesLink =
    body.improvement === "less-promotional" ? false : existing.includesLink;

  const reply = await prisma.socialReply.update({
    where: { id },
    data: {
      content: improved,
      includesLink,
    },
  });

  return NextResponse.json({ reply, improvement: body.improvement });
}
