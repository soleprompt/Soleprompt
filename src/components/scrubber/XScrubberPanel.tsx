"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Link2,
  Loader2,
  ShieldAlert,
  Trash2,
  Unlink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { TweetRiskResult } from "@/lib/social/risk-scorer";
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

type DeletionLogEntry = {
  tweetId: string;
  text: string;
  deletedAt: string;
  status: "deleted" | "failed";
  error?: string;
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

export function XScrubberPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connection, setConnection] = useState<XConnectionState | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [connectionBusy, setConnectionBusy] = useState(false);
  const [tweets, setTweets] = useState<ScoredTweet[]>([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletionLog, setDeletionLog] = useState<DeletionLogEntry[]>([]);
  const [riskFilter, setRiskFilter] = useState<"all" | "medium" | "high">(
    "all",
  );

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
    router.replace("/buyer/scrubber", { scroll: false });
  }, [oauthNotice, router, searchParams]);

  const loadConnection = useCallback(async () => {
    setConnectionLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/buyer/scrubber/x/status");
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
      const response = await fetch("/api/buyer/scrubber/tweets");
      const payload = (await response.json()) as {
        error?: string;
        tweets?: ScoredTweet[];
      };
      if (!response.ok) {
        throw new Error(
          apiErrorMessage(response, payload, "Failed to fetch tweets."),
        );
      }
      setTweets(payload.tweets ?? []);
      setSelected(new Set());
      setMessage(`Loaded ${payload.tweets?.length ?? 0} recent tweets.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tweets.");
    } finally {
      setTweetsLoading(false);
    }
  }, []);

  const filteredTweets = useMemo(() => {
    if (riskFilter === "all") return tweets;
    if (riskFilter === "high") {
      return tweets.filter((t) => t.risk.level === "high");
    }
    return tweets.filter(
      (t) => t.risk.level === "medium" || t.risk.level === "high",
    );
  }, [tweets, riskFilter]);

  const selectedTweets = useMemo(
    () => tweets.filter((t) => selected.has(t.id)),
    [tweets, selected],
  );

  function toggleSelected(tweetId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tweetId)) {
        next.delete(tweetId);
      } else {
        next.add(tweetId);
      }
      return next;
    });
  }

  function selectAllFiltered() {
    setSelected(new Set(filteredTweets.map((t) => t.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function handleDisconnect() {
    setConnectionBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/buyer/scrubber/x/disconnect", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(await parseApiError(response, "Failed to disconnect X account."));
      }
      setTweets([]);
      setSelected(new Set());
      setMessage("X account disconnected.");
      await loadConnection();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed.");
    } finally {
      setConnectionBusy(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (selected.size === 0) return;

    setDeleteBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/buyer/scrubber/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tweetIds: [...selected],
          confirmed: true,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        deleted?: string[];
        failed?: Array<{ tweetId: string; error: string }>;
        deletedAt?: string;
      };

      if (!response.ok) {
        throw new Error(
          apiErrorMessage(response, payload, "Deletion failed."),
        );
      }

      const deletedSet = new Set(payload.deleted ?? []);
      const failedMap = new Map(
        (payload.failed ?? []).map((f) => [f.tweetId, f.error]),
      );
      const deletedAt = payload.deletedAt ?? new Date().toISOString();

      const newLogEntries: DeletionLogEntry[] = selectedTweets.map((tweet) => ({
        tweetId: tweet.id,
        text: tweet.text,
        deletedAt,
        status: deletedSet.has(tweet.id) ? "deleted" : "failed",
        error: failedMap.get(tweet.id),
      }));

      setDeletionLog((prev) => [...newLogEntries, ...prev]);
      setTweets((prev) => prev.filter((t) => !deletedSet.has(t.id)));
      setSelected(new Set());
      setShowConfirm(false);

      const deletedCount = payload.deleted?.length ?? 0;
      const failedCount = payload.failed?.length ?? 0;
      setMessage(
        `Deleted ${deletedCount} tweet${deletedCount === 1 ? "" : "s"}` +
          (failedCount > 0 ? `; ${failedCount} failed.` : "."),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deletion failed.");
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">X Connection</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect your X account to scan and delete tweets. Nothing is
                removed without your confirmation.
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
            <Link href="/api/buyer/scrubber/x/connect">
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
                Scan tweets
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

      {tweets.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Tweet risk scan</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredTweets.length} shown · {selected.size} selected
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["all", "medium", "high"] as const).map((level) => (
                  <Button
                    key={level}
                    size="sm"
                    variant={riskFilter === level ? "primary" : "outline"}
                    onClick={() => setRiskFilter(level)}
                  >
                    {level === "all" ? "All" : level === "medium" ? "Medium+" : "High only"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={selectAllFiltered}>
                Select visible
              </Button>
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                Clear selection
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={selected.size === 0}
                onClick={() => setShowConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete selected ({selected.size})
              </Button>
            </div>

            <ul className="space-y-3">
              {filteredTweets.map((tweet) => (
                <li
                  key={tweet.id}
                  className="rounded-xl border border-border p-4 transition-colors hover:border-electric/20"
                >
                  <label className="flex cursor-pointer gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-border"
                      checked={selected.has(tweet.id)}
                      onChange={() => toggleSelected(tweet.id)}
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={riskBadgeVariant(tweet.risk.level)}>
                          {tweet.risk.level} · {tweet.risk.score}
                        </Badge>
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
                  </label>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <h3 className="text-lg font-semibold">Confirm deletion</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You are about to permanently delete {selected.size} tweet
                {selected.size === 1 ? "" : "s"} from X. This cannot be undone.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
                {selectedTweets.slice(0, 5).map((tweet) => (
                  <li
                    key={tweet.id}
                    className="rounded-lg bg-muted/50 px-3 py-2 line-clamp-2"
                  >
                    {tweet.text}
                  </li>
                ))}
                {selectedTweets.length > 5 && (
                  <li className="text-muted-foreground">
                    …and {selectedTweets.length - 5} more
                  </li>
                )}
              </ul>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowConfirm(false)}
                  disabled={deleteBusy}
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => void handleDeleteConfirmed()}
                  disabled={deleteBusy}
                >
                  {deleteBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Yes, delete permanently
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {deletionLog.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Deletion log</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Record of tweets removed during this session.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {deletionLog.map((entry) => (
                <li
                  key={`${entry.tweetId}-${entry.deletedAt}`}
                  className="rounded-lg border border-border px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        entry.status === "deleted" ? "electric" : "outline"
                      }
                    >
                      {entry.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(entry.deletedAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2">{entry.text}</p>
                  {entry.error && (
                    <p className="mt-1 text-xs text-red-500">{entry.error}</p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
