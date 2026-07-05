import { NextResponse } from "next/server";
import { requireScrubberUser } from "@/lib/scrubber/api-auth";
import { getXConnectionStatusForUser } from "@/lib/social/x-connection";

export async function GET() {
  const user = await requireScrubberUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getXConnectionStatusForUser(user.dbUser.id);
  return NextResponse.json(status);
}
