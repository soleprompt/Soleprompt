import { NextResponse } from "next/server";
import { requireSignedInUser } from "@/lib/x-checker/api-auth";
import { disconnectXConnectionForUser } from "@/lib/social/x-connection";

export async function POST() {
  const user = await requireSignedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await disconnectXConnectionForUser(user.dbUser.id);
  return NextResponse.json({ ok: true });
}
