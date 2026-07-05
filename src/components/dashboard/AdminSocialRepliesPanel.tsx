"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Calendar,
  Check,
  ExternalLink,
  Loader2,
  MessageSquare,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { AdminSocialNav } from "@/components/dashboard/AdminSocialNav";
import { AdminTableFilters } from "@/components/dashboard/AdminTableFilters";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { SocialPostStatus, SocialReply } from "@/generated/prisma/client";
import {
  DISCOVERY_KEYWORDS,
  REPLY_CATEGORIES,
  type ReplyCategory,
} from "@/lib/social/reply-templates";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "scheduled", label: "Scheduled" },
  { value: "posted", label: "Posted" },
  { value: "failed", label: "Failed" },
];

function statusBadge(status: SocialPostStatus) {
  switch (status) {
    case "approved":
      return { variant: "purple" as const, label: "Approved" };
    case "scheduled":
      return { variant: "electric" as const, label: "Scheduled" };
    case "posted":
      return { variant: "electric" as const, label: "Posted" };
    case "failed":
      return { variant: "outline" as const, label: "Failed" };
    default:
      return { variant: "default" as const, label: "Draft" };
  }
}

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toDatetimeLocalValue(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

interface AdminSocialRepliesPanelProps {
  initialReplies: SocialReply[];
  statusFilter: string;
}

type ReplyLimitsState = {
  allowed: boolean;
  reason?: string;
  dailyCount: number;
  dailyLimit: number;
  nextAvailableAt: string | null;
};

export function AdminSocialRepliesPanel({
  initialReplies,
  statusFilter,
}: AdminSocialRepliesPanelProps) {
  const router = useRouter();
  const [replies, setReplies] = useState(initialReplies);
  const [pending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tweetUrl, setTweetUrl] = useState("");
  const [targetSnippet, setTargetSnippet] = useState("");
  const [targetAuthor, setTargetAuthor] = useState("");
  const [category, setCategory] = useState<ReplyCategory | "">("");
  const [showDiscover, setShowDiscover] = useState(false);
  const [replyLimits, setReplyLimits] = useState<ReplyLimitsState | null>(null);
  const [limitsLoading, setLimitsLoading] = useState(true);

  const loadReplyLimits = useCallback(async () => {
    setLimitsLoading(true);
    try {
      const response = await fetch("/api/admin/social/reply-limits");
      if (response.ok) {
        const data = (await response.json()) as ReplyLimitsState;
        setReplyLimits(data);
      }
    } finally {
      setLimitsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReplyLimits();
  }, [loadReplyLimits]);

  async function refreshReplies() {
    const query =
      statusFilter && statusFilter !== "all" ? `?status=${statusFilter}` : "";
    const response = await fetch(`/api/admin/social/replies${query}`);
    if (response.ok) {
      const data = (await response.json()) as { replies: SocialReply[] };
      setReplies(data.replies);
    }
    router.refresh();
    await loadReplyLimits();
  }

  function runAction(id: string, action: () => Promise<void>) {
    setActionId(id);
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        await action();
        await refreshReplies();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setActionId(null);
      }
    });
  }

  function handleGenerate() {
    if (!tweetUrl.trim()) {
      setError("Paste a tweet URL or ID first.");
      return;
    }

    startTransition(async () => {
      setMessage(null);
      setError(null);
      try {
        const response = await fetch("/api/admin/social/replies/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tweetUrl: tweetUrl.trim(),
            targetSnippet: targetSnippet.trim() || undefined,
            targetAuthor: targetAuthor.trim() || undefined,
            category: category || undefined,
          }),
        });
        const data = (await response.json()) as {
          reply?: SocialReply;
          category?: string;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to generate reply draft.");
        }
        setMessage(
          `Reply draft created${data.category ? ` (${data.category})` : ""}. Review and approve before posting.`,
        );
        setTweetUrl("");
        setTargetSnippet("");
        setTargetAuthor("");
        setCategory("");
        await refreshReplies();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function handleApprove(replyId: string) {
    runAction(replyId, async () => {
      const response = await fetch(`/api/admin/social/replies/${replyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to approve reply.");
      }
      setMessage("Reply approved. You can post when ready.");
    });
  }

  function handleSchedule(replyId: string, scheduledAt: string) {
    if (!scheduledAt) {
      setError("Pick a date and time to schedule.");
      return;
    }
    runAction(replyId, async () => {
      const response = await fetch(`/api/admin/social/replies/${replyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: new Date(scheduledAt).toISOString() }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to schedule reply.");
      }
      setMessage("Reply scheduled.");
    });
  }

  function handleContentSave(replyId: string, content: string) {
    runAction(replyId, async () => {
      const response = await fetch(`/api/admin/social/replies/${replyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to update content.");
      }
      setMessage("Content saved.");
    });
  }

  function handlePostNow(replyId: string) {
    if (
      !confirm(
        "Post this reply to X now? Only approved replies are published — no auto-reply.",
      )
    ) {
      return;
    }
    runAction(replyId, async () => {
      const response = await fetch(`/api/admin/social/replies/${replyId}/post`, {
        method: "POST",
      });
      const data = (await response.json()) as {
        error?: string;
        reply?: SocialReply;
      };
      if (!response.ok) {
        if (response.status === 429) {
          await loadReplyLimits();
        }
        throw new Error(data.error ?? data.reply?.error ?? "Failed to post reply.");
      }
      if (data.reply?.status !== "posted" || !data.reply.xReplyId) {
        throw new Error(
          data.error ??
            data.reply?.error ??
            "X did not confirm the reply was published.",
        );
      }
      setMessage(
        `Reply posted successfully (tweet ID ${data.reply.xReplyId}).`,
      );
    });
  }

  const draftCount = replies.filter((r) => r.status === "draft").length;
  const scheduledCount = replies.filter((r) => r.status === "scheduled").length;

  return (
    <>
      <AdminSocialNav />
      <AdminTableFilters status={statusFilter} statusOptions={STATUS_OPTIONS} />

      {(message || error) && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-electric/30 bg-electric/10 text-electric"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Reply limits</h2>
              <p className="text-sm text-muted-foreground">
                Safe caps: up to 10 replies per UTC day, at least 30 minutes
                apart. Admin approval required — no auto-reply.
              </p>
            </div>
            <div className="text-sm">
              {limitsLoading ? (
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking limits…
                </span>
              ) : replyLimits ? (
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">
                      {replyLimits.dailyCount}/{replyLimits.dailyLimit}
                    </span>{" "}
                    replies today (UTC)
                  </p>
                  {!replyLimits.allowed && replyLimits.nextAvailableAt && (
                    <p className="text-amber-600 dark:text-amber-400">
                      Next slot: {formatDateTime(replyLimits.nextAvailableAt)}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Add tweet to reply to</h2>
                <p className="text-sm text-muted-foreground">
                  Paste an X status URL or tweet ID. Template-based drafts only —
                  no OpenAI, no auto-posting.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={() => setShowDiscover((v) => !v)}
              >
                <Search className="h-4 w-4" />
                {showDiscover ? "Hide discover" : "Discover"}
              </Button>
            </div>

            {showDiscover && (
              <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  X search requires elevated API access
                </p>
                <p className="mt-1">
                  For MVP, find relevant posts manually on X using keywords like:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-0.5">
                  {DISCOVERY_KEYWORDS.map((keyword) => (
                    <li key={keyword}>{keyword}</li>
                  ))}
                </ul>
                <p className="mt-2">
                  Copy the tweet URL here and optionally paste the tweet text below
                  for better category matching.
                </p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Tweet URL or ID
                </label>
                <Input
                  value={tweetUrl}
                  onChange={(e) => setTweetUrl(e.target.value)}
                  placeholder="https://x.com/user/status/1234567890"
                  disabled={pending && !actionId}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Author handle (optional)
                </label>
                <Input
                  value={targetAuthor}
                  onChange={(e) => setTargetAuthor(e.target.value)}
                  placeholder="@username"
                  disabled={pending && !actionId}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Category (optional)
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as ReplyCategory | "")
                  }
                  disabled={pending && !actionId}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Auto-detect from tweet text</option>
                  {REPLY_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Original tweet text (optional — improves category matching)
                </label>
                <textarea
                  value={targetSnippet}
                  onChange={(e) => setTargetSnippet(e.target.value)}
                  rows={2}
                  disabled={pending && !actionId}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Paste the tweet you're replying to…"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                className="gap-2"
                disabled={pending && !actionId}
                onClick={handleGenerate}
              >
                {pending && !actionId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate reply draft
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold">Reply drafts</h2>
            <p className="text-sm text-muted-foreground">
              {replies.length} repl{replies.length === 1 ? "y" : "ies"}
              {draftCount > 0 ? ` · ${draftCount} draft${draftCount === 1 ? "" : "s"}` : ""}
              {scheduledCount > 0
                ? ` · ${scheduledCount} scheduled`
                : ""}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          {replies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reply drafts yet. Add a tweet URL above to generate a draft.
            </p>
          ) : (
            replies.map((reply) => {
              const badge = statusBadge(reply.status);
              const isBusy = pending && actionId === reply.id;
              const canEdit = reply.status !== "posted";
              const canPublish =
                reply.status === "approved" || reply.status === "scheduled";

              return (
                <article
                  key={reply.id}
                  className="rounded-xl border border-border/60 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    {reply.includesLink && (
                      <Badge variant="outline">Includes link</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {reply.content.length}/280 chars
                    </span>
                    {reply.targetTweetUrl && (
                      <a
                        href={reply.targetTweetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-electric hover:underline"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Original tweet
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {reply.scheduledAt && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        Scheduled {formatDateTime(reply.scheduledAt)}
                      </span>
                    )}
                    {reply.postedAt && (
                      <span className="text-xs text-muted-foreground">
                        Posted {formatDateTime(reply.postedAt)}
                        {reply.xReplyId ? (
                          <>
                            {" · "}
                            <a
                              href={`https://x.com/i/web/status/${reply.xReplyId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-electric hover:underline"
                            >
                              View reply
                            </a>
                          </>
                        ) : (
                          " · missing reply ID"
                        )}
                      </span>
                    )}
                  </div>

                  {(reply.targetAuthor || reply.targetSnippet) && (
                    <div className="mb-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-sm">
                      {reply.targetAuthor && (
                        <p className="font-medium text-muted-foreground">
                          Replying to {reply.targetAuthor}
                        </p>
                      )}
                      {reply.targetSnippet && (
                        <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                          &ldquo;{reply.targetSnippet}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {canEdit ? (
                    <ReplyEditor
                      defaultContent={reply.content}
                      disabled={isBusy}
                      onSave={(content) => handleContentSave(reply.id, content)}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{reply.content}</p>
                  )}

                  {reply.status === "failed" && reply.error && (
                    <div
                      className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                      role="alert"
                    >
                      <p className="font-medium">Reply posting failed</p>
                      <p className="mt-1 whitespace-pre-wrap">{reply.error}</p>
                    </div>
                  )}

                  {reply.status === "scheduled" && reply.error && (
                    <div
                      className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300"
                      role="status"
                    >
                      <p className="font-medium">Posting deferred</p>
                      <p className="mt-1 whitespace-pre-wrap">{reply.error}</p>
                    </div>
                  )}

                  {canEdit && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {reply.status === "draft" && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="gap-1.5"
                          disabled={isBusy}
                          onClick={() => handleApprove(reply.id)}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                      )}

                      {(reply.status === "approved" ||
                        reply.status === "scheduled" ||
                        reply.status === "failed") && (
                        <ScheduleField
                          defaultValue={toDatetimeLocalValue(reply.scheduledAt)}
                          disabled={isBusy}
                          onSchedule={(value) => handleSchedule(reply.id, value)}
                        />
                      )}

                      {canPublish && (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          className="gap-1.5"
                          disabled={isBusy}
                          onClick={() => handlePostNow(reply.id)}
                        >
                          {isBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Post reply
                        </Button>
                      )}

                      {reply.status === "failed" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          disabled={isBusy}
                          onClick={() => handleApprove(reply.id)}
                        >
                          <Check className="h-4 w-4" />
                          Re-approve
                        </Button>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </CardContent>
      </Card>
    </>
  );
}

function ReplyEditor({
  defaultContent,
  disabled,
  onSave,
}: {
  defaultContent: string;
  disabled: boolean;
  onSave: (content: string) => void;
}) {
  const [content, setContent] = useState(defaultContent);

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={3}
        maxLength={280}
        disabled={disabled}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      {content !== defaultContent && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !content.trim()}
          onClick={() => onSave(content.trim())}
        >
          Save content
        </Button>
      )}
    </div>
  );
}

function ScheduleField({
  defaultValue,
  disabled,
  onSchedule,
}: {
  defaultValue: string;
  disabled: boolean;
  onSchedule: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex items-center gap-2">
      <Input
        type="datetime-local"
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        className="w-auto"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || !value}
        onClick={() => onSchedule(value)}
      >
        Schedule
      </Button>
    </div>
  );
}
