import { NextResponse } from "next/server";
import { requireScrubberUser } from "@/lib/scrubber/api-auth";
import { disconnectXConnectionForUser } from "@/lib/social/x-connection";

export async function POST() {
  const user = await requireScrubberUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await disconnectXConnectionForUser(user.dbUser.id);
  return NextResponse.json({ ok: true });
}
