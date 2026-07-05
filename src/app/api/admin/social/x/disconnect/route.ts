import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { disconnectXConnection } from "@/lib/social/x-connection";

export async function POST() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await disconnectXConnection();
  return NextResponse.json({ ok: true });
}
