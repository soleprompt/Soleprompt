import { NextResponse } from "next/server";
import { requireSignedInUser } from "@/lib/x-checker/api-auth";
import { fetchUserTweets } from "@/lib/social/fetch-user-tweets";
import { scoreTweets } from "@/lib/social/risk-scorer";

export async function GET() {
  const user = await requireSignedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await fetchUserTweets(user.dbUser.id, { maxPages: 2 });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const tweets = scoreTweets(result.tweets).sort(
    (a, b) => b.risk.score - a.risk.score,
  );

  const flagged = tweets.filter((t) => t.risk.score > 0);
  const breakdown = {
    low: tweets.filter((t) => t.risk.level === "low").length,
    medium: tweets.filter((t) => t.risk.level === "medium").length,
    high: tweets.filter((t) => t.risk.level === "high").length,
  };

  return NextResponse.json({
    screenName: result.screenName,
    xUserId: result.xUserId,
    tweets,
    count: tweets.length,
    flaggedCount: flagged.length,
    breakdown,
  });
}
