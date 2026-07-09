import { NextResponse } from "next/server";
import { processStudioQueue } from "@/lib/studio/pipeline/worker";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const maxJobs = Number(url.searchParams.get("maxJobs") ?? "5");
  const workerId = request.headers.get("x-worker-id") ?? "cron-worker";

  const result = await processStudioQueue(workerId, maxJobs);
  return NextResponse.json(result);
}
