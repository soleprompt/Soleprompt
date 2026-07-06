"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Link2,
  Loader2,
  Shield,
  ShieldAlert,
  Sparkles,
  Unlink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  getReputationDisplay,
  type TweetRiskResult,
} from "@/lib/social/risk-scorer";
import {
  buildReputationShareFullText,
  buildTwitterIntentUrl,
} from "@/lib/social/share-reputation-score";
import { apiErrorMessage, parseApiError } from "@/lib/api-error";

type XConnectionState = {
  connected: boolean;
  configured: boolean;
  screenName?: string;
  xUserId?: string;
  connectedAt?: string;
};

type ScoredTweet = {
  id: string;
  text: string;
  createdAt: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  risk: TweetRiskResult;
};

type ScanSummary = {
  count: number;
  flaggedCount: number;
  reputationScore: number;
  breakdown: { low: number; medium: number; high: number };
};

type XCheckerPanelProps = {
  scrubberProductId: string | null;
  hasScrubberAccess: boolean;
};

function formatRiskLevel(level: TweetRiskResult["level"]) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function reputationToneClass(tone: ReturnType<typeof getReputationDisplay>["tone"]) {
  switch (tone) {
    case "good":
      return "text-green-600 dark:text-green-400";
    case "caution":
      return "text-amber-600 dark:text-amber-400";
    default:
      return "text-red-600 dark:text-red-400";
  }
}
function riskBadgeVariant(level: TweetRiskResult["level"]) {
  switch (level) {
    case "high":
      return "outline" as const;
    case "medium":
      return "purple" as const;
    default:
      return "default" as const;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function XCheckerPanel({
  scrubberProductId,
  hasScrubberAccess,
}: XCheckerPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connection, setConnection] = useState<XConnectionState | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [connectionBusy, setConnectionBusy] = useState(false);
  const [tweets, setTweets] = useState<ScoredTweet[]>([]);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const oauthNotice = useMemo(() => {
    const x = searchParams.get("x");
    const oauthMessage = searchParams.get("message");
    if (x === "connected") return "X account connected successfully.";
    if (x === "denied") return "X authorization was cancelled.";
    if (x === "error") return oauthMessage ?? "Failed to connect X account.";
    return null;
  }, [searchParams]);

  useEffect(() => {
    if (!oauthNotice) return;

    const x = searchParams.get("x");
    if (x === "error") {
      setError(oauthNotice);
    } else {
      setMessage(oauthNotice);
    }
    router.replace("/tools/x-checker", { scroll: false });
  }, [oauthNotice, router, searchParams]);

  const loadConnection = useCallback(async () => {
    setConnectionLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/buyer/social/x/status");
      const payload = (await response.json()) as XConnectionState & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(
          apiErrorMessage(
            response,
            payload,
            "Could not load X connection status.",
          ),
        );
      }
      setConnection(payload);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load connection status.",
      );
    } finally {
      setConnectionLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConnection();
  }, [loadConnection]);

  const loadTweets = useCallback(async () => {
    setTweetsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/buyer/x-checker/tweets");
      const payload = (await response.json()) as {
        error?: string;
        tweets?: ScoredTweet[];
        count?: number;
        flaggedCount?: number;
        reputationScore?: number;
        breakdown?: ScanSummary["breakdown"];
      };
      if (!response.ok) {
        throw new Error(
          apiErrorMessage(response, payload, "Failed to fetch tweets."),
        );
      }
      setTweets(payload.tweets ?? []);
      setSummary({
        count: payload.count ?? 0,
        flaggedCount: payload.flaggedCount ?? 0,
        reputationScore: payload.reputationScore ?? 100,
        breakdown: payload.breakdown ?? { low: 0, medium: 0, high: 0 },
      });
      const reputation = getReputationDisplay(payload.reputationScore ?? 100);
      setMessage(
        `Scanned ${payload.count ?? 0} tweets — ${payload.flaggedCount ?? 0} flagged · ${reputation.emoji} Reputation Score: ${payload.reputationScore ?? 100}/100`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tweets.");
    } finally {
      setTweetsLoading(false);
    }
  }, []);

  const displayedTweets = useMemo(() => {
    if (showAll) return tweets;
    return tweets.filter((t) => t.risk.score > 0);
  }, [tweets, showAll]);

  const tweetNumbers = useMemo(() => {
    const numbers = new Map<string, number>();
    tweets.forEach((tweet, index) => {
      numbers.set(tweet.id, index + 1);
    });
    return numbers;
  }, [tweets]);

  const reputationDisplay = summary
    ? getReputationDisplay(summary.reputationScore)
    : null;

  async function handleShareScore(score: number) {
    const fullText = buildReputationShareFullText(score);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: fullText });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    window.open(buildTwitterIntentUrl(score), "_blank", "noopener,noreferrer");
  }

  async function handleDisconnect() {
    setConnectionBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/buyer/social/x/disconnect", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Failed to disconnect X account."));
      }
      setTweets([]);
      setSummary(null);
      setMessage("X account disconnected.");
      await loadConnection();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed.");
    } finally {
      setConnectionBusy(false);
    }
  }

  const upsellHref = hasScrubberAccess
    ? "/buyer/scrubber"
    : scrubberProductId
      ? `/prompts/${scrubberProductId}`
      : "/explore?search=scrubbing";

  const upsellLabel = hasScrubberAccess
    ? "Open X Scrubbing Tool"
    : "Get X Scrubbing Tool — $20";

  return (
    <div className="space-y-6">
      {!hasScrubberAccess && (
        <Card className="border-purple/30 bg-purple/5">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Sparkles className="h-4 w-4 text-purple" />
                Free scan — read only
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Upgrade to the X Scrubbing Tool ($20) to delete flagged tweets,
                plus the full social scrubbing prompt bundle.
              </p>
            </div>
            <Link href={upsellHref}>
              <Button variant="secondary">{upsellLabel}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Connect X</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Link your account to scan recent tweets. This free tool is
                read-only — nothing is deleted.
              </p>
            </div>
            {connectionLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : connection?.connected ? (
              <Badge variant="electric">
                @{connection.screenName ?? "connected"}
              </Badge>
            ) : (
              <Badge variant="outline">Not connected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {!connection?.connected ? (
            <Link href="/api/buyer/social/x/connect">
              <Button disabled={!connection?.configured || connectionBusy}>
                <Link2 className="h-4 w-4" />
                Connect X
              </Button>
            </Link>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => void loadTweets()}
                disabled={tweetsLoading}
              >
                {tweetsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldAlert className="h-4 w-4" />
                )}
                Run scan
              </Button>
              <Button
                variant="ghost"
                onClick={() => void handleDisconnect()}
                disabled={connectionBusy}
              >
                {connectionBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unlink className="h-4 w-4" />
                )}
                Disconnect
              </Button>
            </>
          )}
          {!connection?.configured && !connectionLoading && (
            <p className="w-full text-sm text-amber-600 dark:text-amber-400">
              X API credentials (X_API_KEY / X_API_SECRET) are not configured on
              this server. Connect will not work until they are set in Vercel env
              vars.
            </p>
          )}
        </CardContent>
      </Card>

      {message && (
        <div className="rounded-xl border border-electric/30 bg-electric/5 px-4 py-3 text-sm text-foreground">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {summary && reputationDisplay && (
        <Card className="border-electric/20 bg-gradient-to-br from-electric/5 to-purple/5">
          <CardContent className="space-y-4 p-6">
            <div>
              <p
                className={`text-2xl font-semibold tracking-tight ${reputationToneClass(reputationDisplay.tone)}`}
              >
                {reputationDisplay.emoji} Reputation Score:{" "}
                {summary.reputationScore}/100
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {summary.count} Tweets Scanned · {summary.flaggedCount} Flagged
              </p>
            </div>
            <p className="text-sm text-foreground">
              {summary.breakdown.high} High Risk · {summary.breakdown.medium}{" "}
              Medium Risk · {summary.breakdown.low} Low Risk
            </p>
            <button
              type="button"
              onClick={() => void handleShareScore(summary.reputationScore)}
              className="text-sm font-medium text-electric transition-colors hover:text-electric/80"
            >
              Share your score →
            </button>
          </CardContent>
        </Card>
      )}

      {tweets.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Flagged tweets</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {displayedTweets.length} shown
                  {!showAll && summary
                    ? ` of ${summary.flaggedCount} flagged`
                    : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant={showAll ? "primary" : "outline"}
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll ? "Flagged only" : "Show all tweets"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {displayedTweets.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Shield className="h-8 w-8 text-electric" />
                <p className="text-sm font-medium">No flagged tweets found</p>
                <p className="text-sm text-muted-foreground">
                  Your recent timeline looks clean based on our keyword
                  heuristics.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {displayedTweets.map((tweet) => {
                  const isFlagged = tweet.risk.score > 0;
                  const tweetNumber = tweetNumbers.get(tweet.id) ?? 0;
                  const impacts =
                    tweet.risk.impacts.length > 0
                      ? tweet.risk.impacts
                      : tweet.risk.reasons;

                  return (
                    <li
                      key={tweet.id}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="space-y-3">
                        {isFlagged ? (
                          <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm">
                            <p className="flex items-center gap-1.5 font-medium text-foreground">
                              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                              Tweet #{tweetNumber}
                              {tweet.risk.primaryReason && (
                                <span className="font-normal text-muted-foreground">
                                  · {tweet.risk.primaryReason}
                                </span>
                              )}
                            </p>
                            {impacts.length > 0 && (
                              <div>
                                <p className="font-medium text-foreground">
                                  Potential impact
                                </p>
                                <ul className="mt-1 space-y-0.5 text-muted-foreground">
                                  {impacts.map((impact) => (
                                    <li
                                      key={impact}
                                      className="flex items-start gap-1.5"
                                    >
                                      <span className="shrink-0" aria-hidden>
                                        ⚠️
                                      </span>
                                      {impact}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <p>
                              <span className="font-medium text-foreground">
                                Risk:
                              </span>{" "}
                              {formatRiskLevel(tweet.risk.level)}
                            </p>
                            {tweet.risk.confidence > 0 && (
                              <p>
                                <span className="font-medium text-foreground">
                                  Confidence:
                                </span>{" "}
                                {tweet.risk.confidence}%
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="electric">Clean</Badge>
                            <span className="text-xs text-muted-foreground">
                              Tweet #{tweetNumber}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          {isFlagged && (
                            <Badge variant={riskBadgeVariant(tweet.risk.level)}>
                              {formatRiskLevel(tweet.risk.level)} · score{" "}
                              {tweet.risk.score}
                            </Badge>
                          )}
                          {tweet.risk.categories.map((cat) => (
                            <Badge key={cat} variant="outline">
                              {cat}
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(tweet.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{tweet.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {summary && summary.flaggedCount > 0 && !hasScrubberAccess && (
        <Card className="border-electric/30">
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">Ready to clean up?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The X Scrubbing Tool lets you select and permanently delete
                risky tweets — with confirmation for every batch.
              </p>
            </div>
            <Link href={upsellHref}>
              <Button>{upsellLabel}</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
