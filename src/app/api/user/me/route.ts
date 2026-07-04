import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDashboardPath } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/user";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getCurrentUserRole();

  return NextResponse.json({
    role,
    dashboardPath: getDashboardPath(role),
  });
}
