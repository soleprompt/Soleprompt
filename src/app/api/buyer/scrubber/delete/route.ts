import { NextResponse } from "next/server";
import { requireScrubberUser } from "@/lib/scrubber/api-auth";
import { deleteTweets } from "@/lib/social/delete-tweet";

export async function POST(request: Request) {
  const user = await requireScrubberUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { tweetIds?: string[]; confirmed?: boolean };
  try {
    body = (await request.json()) as { tweetIds?: string[]; confirmed?: boolean };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.confirmed) {
    return NextResponse.json(
      { error: "Deletion requires explicit confirmation." },
      { status: 400 },
    );
  }

  const tweetIds = body.tweetIds?.filter(Boolean) ?? [];
  if (tweetIds.length === 0) {
    return NextResponse.json(
      { error: "Select at least one tweet to delete." },
      { status: 400 },
    );
  }

  if (tweetIds.length > 50) {
    return NextResponse.json(
      { error: "Maximum 50 tweets per deletion batch." },
      { status: 400 },
    );
  }

  const result = await deleteTweets(user.dbUser.id, tweetIds);

  return NextResponse.json({
    deleted: result.deleted,
    failed: result.failed,
    deletedAt: new Date().toISOString(),
  });
}
