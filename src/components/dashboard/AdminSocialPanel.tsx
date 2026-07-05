"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Calendar,
  Check,
  Link2,
  Loader2,
  Send,
  Sparkles,
  Unlink,
} from "lucide-react";
import { AdminTableFilters } from "@/components/dashboard/AdminTableFilters";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { SocialPost, SocialPostStatus } from "@/generated/prisma/client";

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

interface AdminSocialPanelProps {
  initialPosts: SocialPost[];
  statusFilter: string;
}

type XConnectionState = {
  connected: boolean;
  configured: boolean;
  screenName?: string;
  xUserId?: string;
  connectedAt?: string;
  source?: "database" | "env";
};

export function AdminSocialPanel({
  initialPosts,
  statusFilter,
}: AdminSocialPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState(initialPosts);
  const [pending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [xConnection, setXConnection] = useState<XConnectionState | null>(null);
  const [xLoading, setXLoading] = useState(true);
  const [xBusy, setXBusy] = useState(false);

  const loadXStatus = useCallback(async () => {
    setXLoading(true);
    try {
      const response = await fetch("/api/admin/social/x/status");
      if (response.ok) {
        const data = (await response.json()) as XConnectionState;
        setXConnection(data);
      }
    } finally {
      setXLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadXStatus();
  }, [loadXStatus]);

  useEffect(() => {
    const xParam = searchParams.get("x");
    const xMessage = searchParams.get("message");

    if (xParam === "connected") {
      setMessage("X account connected successfully.");
      void loadXStatus();
      router.replace("/admin/social");
    } else if (xParam === "denied") {
      setError("X authorization was cancelled.");
      router.replace("/admin/social");
    } else if (xParam === "error") {
      setError(xMessage ?? "Failed to connect X account.");
      router.replace("/admin/social");
    }
  }, [loadXStatus, router, searchParams]);

  async function refreshPosts() {
    const query =
      statusFilter && statusFilter !== "all" ? `?status=${statusFilter}` : "";
    const response = await fetch(`/api/admin/social/posts${query}`);
    if (response.ok) {
      const data = (await response.json()) as { posts: SocialPost[] };
      setPosts(data.posts);
    }
    router.refresh();
  }

  function runAction(id: string, action: () => Promise<void>) {
    setActionId(id);
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        await action();
        await refreshPosts();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setActionId(null);
      }
    });
  }

  function handleGenerate() {
    startTransition(async () => {
      setMessage(null);
      setError(null);
      try {
        const response = await fetch("/api/admin/social/generate", {
          method: "POST",
        });
        const data = (await response.json()) as {
          count?: number;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to generate tweets.");
        }
        setMessage(`Generated ${data.count ?? 0} draft tweet ideas.`);
        await refreshPosts();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function handleApprove(postId: string) {
    runAction(postId, async () => {
      const response = await fetch(`/api/admin/social/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to approve post.");
      }
      setMessage("Post approved.");
    });
  }

  function handleSchedule(postId: string, scheduledAt: string) {
    if (!scheduledAt) {
      setError("Pick a date and time to schedule.");
      return;
    }
    runAction(postId, async () => {
      const response = await fetch(`/api/admin/social/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: new Date(scheduledAt).toISOString() }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to schedule post.");
      }
      setMessage("Post scheduled.");
    });
  }

  function handleContentSave(postId: string, content: string) {
    runAction(postId, async () => {
      const response = await fetch(`/api/admin/social/posts/${postId}`, {
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

  function handlePostNow(postId: string) {
    if (
      !confirm(
        "Post this tweet to X now? Only approved or scheduled posts should be published.",
      )
    ) {
      return;
    }
    runAction(postId, async () => {
      const response = await fetch(`/api/admin/social/posts/${postId}/post`, {
        method: "POST",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to post to X.");
      }
      setMessage("Posted to X successfully.");
    });
  }

  const draftCount = posts.filter((post) => post.status === "draft").length;
  const scheduledCount = posts.filter((post) => post.status === "scheduled").length;

  function handleConnectX() {
    window.location.href = "/api/admin/social/x/connect";
  }

  function handleDisconnectX() {
    if (!confirm("Disconnect the linked X account? Posts will fall back to env tokens if configured.")) {
      return;
    }

    setXBusy(true);
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/social/x/disconnect", {
          method: "POST",
        });
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to disconnect X account.");
        }
        setMessage("X account disconnected.");
        await loadXStatus();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setXBusy(false);
      }
    });
  }

  return (
    <>
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">X account</h2>
              <p className="text-sm text-muted-foreground">
                Connect the account used to publish approved posts. Tokens are stored server-side only.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {xLoading ? (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking connection…
                </span>
              ) : xConnection?.connected ? (
                <>
                  <Badge variant="electric">
                    Connected
                    {xConnection.screenName ? ` · @${xConnection.screenName}` : ""}
                  </Badge>
                  {xConnection.source === "env" && (
                    <span className="text-xs text-muted-foreground">
                      via env vars
                    </span>
                  )}
                  {xConnection.source === "database" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={xBusy || pending}
                      onClick={handleDisconnectX}
                    >
                      {xBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Unlink className="h-4 w-4" />
                      )}
                      Disconnect
                    </Button>
                  )}
                </>
              ) : xConnection?.configured ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  className="gap-1.5"
                  disabled={xBusy || pending}
                  onClick={handleConnectX}
                >
                  <Link2 className="h-4 w-4" />
                  Connect X account
                </Button>
              ) : (
                <Badge variant="outline">Not configured</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Generate tweet ideas</h2>
              <p className="text-sm text-muted-foreground">
                Template-based drafts only — no auto-posting, DMs, likes, or follows.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              className="gap-2"
              disabled={pending}
              onClick={handleGenerate}
            >
              {pending && !actionId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate tweet ideas
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h2 className="text-lg font-semibold">Promotional posts</h2>
            <p className="text-sm text-muted-foreground">
              {posts.length} post{posts.length === 1 ? "" : "s"}
              {draftCount > 0 ? ` · ${draftCount} draft${draftCount === 1 ? "" : "s"}` : ""}
              {scheduledCount > 0
                ? ` · ${scheduledCount} scheduled`
                : ""}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No posts yet. Generate tweet ideas to create draft posts.
            </p>
          ) : (
            posts.map((post) => {
              const badge = statusBadge(post.status);
              const isBusy = pending && actionId === post.id;
              const canEdit = post.status !== "posted";
              const canPublish =
                post.status === "approved" ||
                post.status === "scheduled" ||
                post.status === "failed" ||
                post.status === "draft";

              return (
                <article
                  key={post.id}
                  className="rounded-xl border border-border/60 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {post.content.length}/280 chars
                    </span>
                    {post.scheduledAt && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        Scheduled {formatDateTime(post.scheduledAt)}
                      </span>
                    )}
                    {post.postedAt && (
                      <span className="text-xs text-muted-foreground">
                        Posted {formatDateTime(post.postedAt)}
                        {post.xPostId ? ` · ID ${post.xPostId}` : ""}
                      </span>
                    )}
                  </div>

                  {canEdit ? (
                    <PostEditor
                      defaultContent={post.content}
                      disabled={isBusy}
                      onSave={(content) => handleContentSave(post.id, content)}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{post.content}</p>
                  )}

                  {post.error && (
                    <p className="mt-2 text-sm text-destructive">{post.error}</p>
                  )}

                  {canEdit && (
                    <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        {post.status === "draft" && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="gap-1.5"
                            disabled={isBusy}
                            onClick={() => handleApprove(post.id)}
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                        )}

                        {(post.status === "approved" ||
                          post.status === "scheduled" ||
                          post.status === "failed") && (
                          <ScheduleField
                            defaultValue={toDatetimeLocalValue(post.scheduledAt)}
                            disabled={isBusy}
                            onSchedule={(value) => handleSchedule(post.id, value)}
                          />
                        )}

                        {canPublish && (
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            className="gap-1.5"
                            disabled={isBusy}
                            onClick={() => handlePostNow(post.id)}
                          >
                            {isBusy ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            Post now
                          </Button>
                        )}
                      </div>
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

function PostEditor({
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
        rows={4}
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
