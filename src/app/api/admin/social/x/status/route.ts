import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { getXConnectionStatus } from "@/lib/social/x-connection";

export async function GET() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getXConnectionStatus();
  return NextResponse.json(status);
}
