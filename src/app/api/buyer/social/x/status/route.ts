import { NextResponse } from "next/server";
import { requireSignedInUser } from "@/lib/x-checker/api-auth";
import { getXConnectionStatusForUser } from "@/lib/social/x-connection";

export async function GET() {
  const user = await requireSignedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getXConnectionStatusForUser(user.dbUser.id);
  return NextResponse.json(status);
}
