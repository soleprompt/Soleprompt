import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { getAdminSocialReplies } from "@/lib/social/reply-data";

export async function GET(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const statusFilter =
    statusParam && statusParam !== "all" ? statusParam : "all";

  const { data: replies, error } = await getAdminSocialReplies(statusFilter);

  if (error) {
    return NextResponse.json({ error, replies: [] }, { status: 503 });
  }

  return NextResponse.json({ replies });
}
