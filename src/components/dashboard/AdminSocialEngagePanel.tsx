"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Check,
  ExternalLink,
  Loader2,
  Plus,
  Radar,
  Send,
  Sparkles,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { AdminSocialNav } from "@/components/dashboard/AdminSocialNav";
import { AdminTableFilters } from "@/components/dashboard/AdminTableFilters";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type {
  EngageReplyDraft,
  EngageTargetAccount,
  SocialPostStatus,
} from "@/generated/prisma/client";
import { ENGAGE_REPLY_STYLES } from "@/lib/social/engage-draft-generator";
import { ENGAGE_TOPICS } from "@/lib/social/engage-topics";
import type { EngagePostWithDrafts } from "@/lib/social/engage-data";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "posted", label: "Posted" },
  { value: "failed", label: "Failed" },
];

const STYLE_LABELS = Object.fromEntries(
  ENGAGE_REPLY_STYLES.map((s) => [s.id, s.label]),
) as Record<string, string>;

const TOPIC_LABELS = Object.fromEntries(
  ENGAGE_TOPICS.map((t) => [t.id, t.label]),
) as Record<string, string>;

function statusBadge(status: SocialPostStatus) {
  switch (status) {
    case "approved":
      return { variant: "purple" as const, label: "Approved" };
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
    hour: "numeric",
    minute: "2-digit",
  });
}

type ReplyLimitsState = {
  allowed: boolean;
  reason?: string;
  dailyCount: number;
  dailyLimit: number;
  nextAvailableAt: string | null;
};

interface AdminSocialEngagePanelProps {
  initialAccounts: EngageTargetAccount[];
  initialPosts: EngagePostWithDrafts[];
  statusFilter: string;
  loadError?: string;
}

export function AdminSocialEngagePanel({
  initialAccounts,
  initialPosts,
  statusFilter,
  loadError,
}: AdminSocialEngagePanelProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [posts, setPosts] = useState(initialPosts);
  const [pending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(loadError ?? null);
  const [newUsername, setNewUsername] = useState("");
  const [editContent, setEditContent] = useState<Record<string, string>>({});
  const [replyLimits, setReplyLimits] = useState<ReplyLimitsState | null>(null);
  const [limitsLoading, setLimitsLoading] = useState(true);

  const refreshLimits = useCallback(async () => {
    setLimitsLoading(true);
    try {
      const res = await fetch("/api/admin/social/engage/limits");
      const data = await res.json();
      if (res.ok) {
        setReplyLimits(data);
      }
    } finally {
      setLimitsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshLimits();
  }, [refreshLimits]);

  const refreshPosts = useCallback(async () => {
    const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/admin/social/engage/posts${params}`);
    const data = await res.json();
    if (res.ok) {
      setPosts(data.posts);
    }
  }, [statusFilter]);

  async function handleAddAccount() {
    setError(null);
    setMessage(null);
    setActionId("add-account");

    try {
      const res = await fetch("/api/admin/social/engage/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to add account.");
        return;
      }

      setAccounts((prev) => [...prev, data.account].sort((a, b) => a.username.localeCompare(b.username)));
      setNewUsername("");
      setMessage(`Added @${data.account.username}.`);
    } finally {
      setActionId(null);
    }
  }

  async function handleRemoveAccount(id: string) {
    setError(null);
    setActionId(id);

    try {
      const res = await fetch(`/api/admin/social/engage/accounts/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to remove account.");
        return;
      }

      setAccounts((prev) => prev.filter((a) => a.id !== id));
      setMessage("Target account removed.");
    } finally {
      setActionId(null);
    }
  }

  async function handleScan() {
    setError(null);
    setMessage(null);
    setActionId("scan");

    try {
      const res = await fetch("/api/admin/social/engage/scan", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Scan failed.");
        return;
      }

      const accountErrors = (data.results as { username: string; error?: string }[])
        .filter((r) => r.error)
        .map((r) => `@${r.username}: ${r.error}`);

      if (accountErrors.length > 0) {
        setError(accountErrors.join(" "));
      }

      setMessage(
        `Scanned ${data.accountsScanned} account(s). ${data.newPosts} new relevant post(s) found.`,
      );

      startTransition(() => {
        void refreshPosts();
        router.refresh();
      });
    } finally {
      setActionId(null);
    }
  }

  async function handleGenerateDrafts(postId: string) {
    setError(null);
    setMessage(null);
    setActionId(postId);

    try {
      const res = await fetch(
        `/api/admin/social/engage/posts/${postId}/generate`,
        { method: "POST" },
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to generate drafts.");
        return;
      }

      setMessage(
        data.autoApproved
          ? "Auto-approved best reply draft. Cron will publish when within daily limits."
          : "Generated 3 reply drafts.",
      );
      await refreshPosts();
    } finally {
      setActionId(null);
    }
  }

  async function handleDraftAction(
    draftId: string,
    action: "approve" | "post" | "delete",
    content?: string,
  ) {
    setError(null);
    setMessage(null);
    setActionId(draftId);

    try {
      if (action === "delete") {
        const res = await fetch(`/api/admin/social/engage/drafts/${draftId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to delete draft.");
          return;
        }
        setMessage("Draft deleted.");
        await refreshPosts();
        return;
      }

      if (action === "approve") {
        const res = await fetch(`/api/admin/social/engage/drafts/${draftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "approved",
            ...(content ? { content } : {}),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to approve draft.");
          return;
        }
        setMessage("Draft approved. You can post when ready.");
        await refreshPosts();
        return;
      }

      const res = await fetch(`/api/admin/social/engage/drafts/${draftId}/post`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to post reply.");
        if (data.draft) {
          await refreshPosts();
        }
        await refreshLimits();
        return;
      }

      setMessage("Reply posted to X.");
      await refreshPosts();
      await refreshLimits();
    } finally {
      setActionId(null);
    }
  }

  function renderDraft(draft: EngageReplyDraft) {
    const badge = statusBadge(draft.status);
    const isBusy = actionId === draft.id;
    const content = editContent[draft.id] ?? draft.content;

    return (
      <div
        key={draft.id}
        className="rounded-lg border border-border/60 bg-muted/20 p-4"
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{STYLE_LABELS[draft.style] ?? draft.style}</Badge>
          <Badge variant={badge.variant}>{badge.label}</Badge>
          {draft.includesLink && <Badge variant="electric">Link</Badge>}
        </div>

        {draft.status !== "posted" ? (
          <textarea
            className="mb-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            rows={3}
            value={content}
            onChange={(e) =>
              setEditContent((prev) => ({ ...prev, [draft.id]: e.target.value }))
            }
          />
        ) : (
          <p className="mb-3 text-sm text-foreground">{draft.content}</p>
        )}

        <p className="mb-3 text-xs text-muted-foreground">
          {content.length}/280 characters
        </p>

        {draft.error && (
          <p className="mb-3 text-sm text-destructive">{draft.error}</p>
        )}

        {draft.xReplyId && (
          <p className="mb-3 text-xs text-muted-foreground">
            X reply ID: {draft.xReplyId}
          </p>
        )}

        {draft.status !== "posted" && (
          <div className="flex flex-wrap gap-2">
            {draft.status !== "approved" && (
              <Button
                size="sm"
                variant="secondary"
                disabled={isBusy || pending}
                onClick={() =>
                  handleDraftAction(
                    draft.id,
                    "approve",
                    editContent[draft.id],
                  )
                }
              >
                {isBusy ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Check className="mr-1 h-3 w-3" />
                )}
                Approve
              </Button>
            )}

            {draft.status === "approved" && (
              <Button
                size="sm"
                disabled={
                  isBusy ||
                  pending ||
                  limitsLoading ||
                  replyLimits?.allowed === false
                }
                onClick={() => handleDraftAction(draft.id, "post")}
              >
                {isBusy ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Send className="mr-1 h-3 w-3" />
                )}
                Post to X
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              disabled={isBusy || pending}
              onClick={() => handleDraftAction(draft.id, "delete")}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <AdminSocialNav />

      {(message || error) && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-electric/40 bg-electric/10 text-foreground"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium">Tweet rate limits</h3>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {limitsLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </span>
            ) : replyLimits ? (
              <div className="space-y-1">
                <p>
                  Tweets today (posts + replies): {replyLimits.dailyCount} /{" "}
                  {replyLimits.dailyLimit}
                </p>
                {replyLimits.allowed ? (
                  <p className="text-electric">Ready to post</p>
                ) : (
                  <p className="text-destructive">{replyLimits.reason}</p>
                )}
                {replyLimits.nextAvailableAt && !replyLimits.allowed && (
                  <p>
                    Next slot: {formatDateTime(replyLimits.nextAvailableAt)}
                  </p>
                )}
              </div>
            ) : (
              <p>Limits unavailable</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium">Topics monitored</h3>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {ENGAGE_TOPICS.map((topic) => (
              <Badge key={topic.id} variant="outline">
                {topic.label}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-electric" />
            <h3 className="font-medium">Target accounts</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="@OpenAI, levelsio, a16z…"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="max-w-xs"
            />
            <Button
              onClick={handleAddAccount}
              disabled={!newUsername.trim() || actionId === "add-account"}
            >
              {actionId === "add-account" ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-1 h-4 w-4" />
              )}
              Add account
            </Button>
            <Button
              variant="secondary"
              onClick={handleScan}
              disabled={accounts.length === 0 || actionId === "scan"}
            >
              {actionId === "scan" ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Radar className="mr-1 h-4 w-4" />
              )}
              Scan for posts
            </Button>
          </div>

          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No target accounts yet. Add accounts like @OpenAI, @levelsio, @a16z, or @rowancheung.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-sm"
                >
                  <span>@{account.username}</span>
                  {!account.active && (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={actionId === account.id}
                    onClick={() => handleRemoveAccount(account.id)}
                    aria-label={`Remove @${account.username}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AdminTableFilters status={statusFilter} statusOptions={STATUS_OPTIONS} />

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No relevant posts yet. Add target accounts and run a scan.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">@{post.authorUsername}</span>
                      <Badge variant="purple">
                        Score {post.relevanceScore}
                      </Badge>
                      {post.matchedTopics.map((topic) => (
                        <Badge key={topic} variant="outline">
                          {TOPIC_LABELS[topic] ?? topic}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(post.tweetedAt)} · {post.likeCount} likes
                    </p>
                  </div>
                  <a
                    href={post.tweetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-electric hover:underline"
                  >
                    View on X
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{post.tweetText}</p>

                {post.drafts.length === 0 ? (
                  <Button
                    variant="secondary"
                    disabled={actionId === post.id || pending}
                    onClick={() => handleGenerateDrafts(post.id)}
                  >
                    {actionId === post.id ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-1 h-4 w-4" />
                    )}
                    Generate 3 drafts
                  </Button>
                ) : (
                  <div className="grid gap-3 lg:grid-cols-3">
                    {post.drafts.map((draft) => renderDraft(draft))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
