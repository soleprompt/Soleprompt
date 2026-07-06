import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatDbReadError } from "@/lib/safe-db";
import {
  buildTweetUrl,
  fetchAccountTweets,
  lookupXUserByUsername,
} from "@/lib/social/fetch-account-tweets";
import { isRelevantPost, scoreTopicRelevance } from "@/lib/social/engage-topics";

export async function POST() {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accounts = await prisma.engageTargetAccount.findMany({
      where: { active: true },
    });

    if (accounts.length === 0) {
      return NextResponse.json(
        { error: "Add at least one active target account first." },
        { status: 400 },
      );
    }

    const results: {
      username: string;
      scanned: number;
      relevant: number;
      error?: string;
    }[] = [];

    let totalNew = 0;
    let totalRelevant = 0;

    for (const account of accounts) {
      let xUserId = account.xUserId;

      if (!xUserId) {
        const lookup = await lookupXUserByUsername(account.username);
        if (!lookup.ok) {
          results.push({
            username: account.username,
            scanned: 0,
            relevant: 0,
            error: lookup.error,
          });
          continue;
        }

        xUserId = lookup.xUserId;
        await prisma.engageTargetAccount.update({
          where: { id: account.id },
          data: { xUserId, username: lookup.username },
        });
      }

      const tweetsResult = await fetchAccountTweets(xUserId);
      if (!tweetsResult.ok) {
        results.push({
          username: account.username,
          scanned: 0,
          relevant: 0,
          error: tweetsResult.error,
        });
        continue;
      }

      let relevantForAccount = 0;

      for (const tweet of tweetsResult.tweets) {
        if (!isRelevantPost(tweet.text)) {
          continue;
        }

        const { score, matchedTopics } = scoreTopicRelevance(tweet.text);
        relevantForAccount += 1;

        const existing = await prisma.engagePost.findUnique({
          where: { xTweetId: tweet.id },
        });

        if (existing) {
          await prisma.engagePost.update({
            where: { id: existing.id },
            data: {
              relevanceScore: score,
              matchedTopics,
              likeCount: tweet.likeCount,
              replyCount: tweet.replyCount,
              retweetCount: tweet.retweetCount,
              scannedAt: new Date(),
            },
          });
          continue;
        }

        await prisma.engagePost.create({
          data: {
            targetAccountId: account.id,
            xTweetId: tweet.id,
            authorUsername: account.username,
            tweetText: tweet.text,
            tweetUrl: buildTweetUrl(account.username, tweet.id),
            tweetedAt: new Date(tweet.createdAt),
            relevanceScore: score,
            matchedTopics,
            likeCount: tweet.likeCount,
            replyCount: tweet.replyCount,
            retweetCount: tweet.retweetCount,
          },
        });

        totalNew += 1;
      }

      totalRelevant += relevantForAccount;
      results.push({
        username: account.username,
        scanned: tweetsResult.tweets.length,
        relevant: relevantForAccount,
      });
    }

    return NextResponse.json({
      ok: true,
      accountsScanned: accounts.length,
      newPosts: totalNew,
      relevantPosts: totalRelevant,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: formatDbReadError(error) },
      { status: 503 },
    );
  }
}
