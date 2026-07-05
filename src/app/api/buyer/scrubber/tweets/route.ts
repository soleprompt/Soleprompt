import { NextResponse } from "next/server";
import { requireScrubberUser } from "@/lib/scrubber/api-auth";
import { fetchUserTweets } from "@/lib/social/fetch-user-tweets";
import { scoreTweets } from "@/lib/social/risk-scorer";

export async function GET() {
  const user = await requireScrubberUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await fetchUserTweets(user.dbUser.id);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const tweets = scoreTweets(result.tweets).sort(
    (a, b) => b.risk.score - a.risk.score,
  );

  return NextResponse.json({
    screenName: result.screenName,
    xUserId: result.xUserId,
    tweets,
    count: tweets.length,
  });
}
