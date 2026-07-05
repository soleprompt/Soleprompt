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
import type { TweetRiskResult } from "@/lib/social/risk-scorer";

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
  breakdown: { low: number; medium: number; high: number };
};

type XCheckerPanelProps = {
  scrubberProductId: string | null;
  hasScrubberAccess: boolean;
};

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
    if (oauthNotice) {
      setMessage(oauthNotice);
      router.replace("/tools/x-checker", { scroll: false });
    }
  }, [oauthNotice, router]);

  const loadConnection = useCallback(async () => {
    setConnectionLoading(true);
    try {
      const response = await fetch("/api/buyer/social/x/status");
      if (!response.ok) {
        throw new Error("Could not load X connection status.");
      }
      setConnection((await response.json()) as XConnectionState);
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
        breakdown?: ScanSummary["breakdown"];
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to fetch tweets.");
      }
      setTweets(payload.tweets ?? []);
      setSummary({
        count: payload.count ?? 0,
        flaggedCount: payload.flaggedCount ?? 0,
        breakdown: payload.breakdown ?? { low: 0, medium: 0, high: 0 },
      });
      setMessage(
        `Scanned ${payload.count ?? 0} tweets — ${payload.flaggedCount ?? 0} flagged for review.`,
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

  async function handleDisconnect() {
    setConnectionBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/buyer/social/x/disconnect", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to disconnect X account.");
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
            <p className="w-full text-sm text-muted-foreground">
              X API credentials are not configured on this server.
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

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total scanned
              </p>
              <p className="mt-1 text-2xl font-semibold">{summary.count}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Flagged
              </p>
              <p className="mt-1 text-2xl font-semibold text-purple">
                {summary.flaggedCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Medium risk
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {summary.breakdown.medium}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                High risk
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {summary.breakdown.high}
              </p>
            </CardContent>
          </Card>
        </div>
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
              <ul className="space-y-3">
                {displayedTweets.map((tweet) => (
                  <li
                    key={tweet.id}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={riskBadgeVariant(tweet.risk.level)}>
                          {tweet.risk.level} · score {tweet.risk.score}
                        </Badge>
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
                      {tweet.risk.reasons.length > 0 && (
                        <ul className="text-xs text-muted-foreground">
                          {tweet.risk.reasons.map((reason) => (
                            <li key={reason} className="flex items-start gap-1">
                              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
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
