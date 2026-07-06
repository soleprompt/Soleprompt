"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link2, Loader2, ScanSearch, Unlink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { apiErrorMessage } from "@/lib/api-error";
import { trackClickThrough } from "@/lib/click-throughs/client";
import {
  SOCIAL_TOOL_DESCRIPTIONS,
  SOCIAL_TOOL_LABELS,
  type SocialToolPlatform,
} from "@/lib/social-tools/constants";

type SocialConnectionState = {
  connected: boolean;
  configured: boolean;
  displayName?: string;
  platformUserId?: string;
  connectedAt?: string;
};

type SocialToolPanelProps = {
  platform: SocialToolPlatform;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SocialToolPanel({ platform }: SocialToolPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const label = SOCIAL_TOOL_LABELS[platform];

  const [connection, setConnection] = useState<SocialConnectionState | null>(
    null,
  );
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [connectionBusy, setConnectionBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const oauthNotice = useMemo(() => {
    const oauth = searchParams.get("oauth");
    const oauthMessage = searchParams.get("message");
    if (oauth === "connected") return `${label} account connected successfully.`;
    if (oauth === "denied") {
      return oauthMessage
        ? `${label} authorization was cancelled: ${oauthMessage}`
        : `${label} authorization was cancelled.`;
    }
    if (oauth === "error") {
      return oauthMessage ?? `Failed to connect ${label} account.`;
    }
    return null;
  }, [label, searchParams]);

  useEffect(() => {
    if (!oauthNotice) return;

    const oauth = searchParams.get("oauth");
    if (oauth === "error" || oauth === "denied") {
      setError(oauthNotice);
    } else {
      setMessage(oauthNotice);
    }
    router.replace(`/buyer/social/${platform}`, { scroll: false });
  }, [oauthNotice, platform, router, searchParams]);

  const loadConnection = useCallback(async () => {
    setConnectionLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/buyer/social-tools/${platform}/status`,
      );
      const payload = (await response.json()) as SocialConnectionState & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(
          apiErrorMessage(
            response,
            payload,
            `Could not load ${label} connection status.`,
          ),
        );
      }
      setConnection(payload);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : `Could not load ${label} connection status.`,
      );
    } finally {
      setConnectionLoading(false);
    }
  }, [label, platform]);

  useEffect(() => {
    void loadConnection();
  }, [loadConnection]);

  const handleConnect = () => {
    trackClickThrough({
      eventType: "oauth_connect",
      targetKey: platform,
      metadata: { source: "social-tool-panel" },
    });
    window.location.href = `/api/buyer/social-tools/${platform}/connect`;
  };

  const handleDisconnect = async () => {
    setConnectionBusy(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/buyer/social-tools/${platform}/disconnect`,
        { method: "POST" },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(
          apiErrorMessage(response, payload, `Could not disconnect ${label}.`),
        );
      }
      setMessage(`${label} account disconnected.`);
      await loadConnection();
    } catch (disconnectError) {
      setError(
        disconnectError instanceof Error
          ? disconnectError.message
          : `Could not disconnect ${label}.`,
      );
    } finally {
      setConnectionBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Account connection</h2>
          <p className="text-sm text-muted-foreground">
            {SOCIAL_TOOL_DESCRIPTIONS[platform]}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectionLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking connection…
            </div>
          ) : connection?.connected ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{connection.displayName}</p>
                {connection.connectedAt ? (
                  <p className="text-sm text-muted-foreground">
                    Connected {formatDate(connection.connectedAt)}
                  </p>
                ) : null}
              </div>
              <Button
                variant="outline"
                onClick={() => void handleDisconnect()}
                disabled={connectionBusy}
              >
                {connectionBusy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Unlink className="mr-2 h-4 w-4" />
                )}
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {connection?.configured
                  ? `Connect your ${label} account to prepare for content scanning.`
                  : `${label} OAuth is not configured on this server yet.`}
              </p>
              <Button onClick={handleConnect} disabled={!connection?.configured}>
                <Link2 className="mr-2 h-4 w-4" />
                Connect {label}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Content scanner</h2>
          <p className="text-sm text-muted-foreground">
            Post scanning, risk scoring, and selective deletion are coming soon.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-center">
            <ScanSearch className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Scanner not available yet</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Connect your account now. Scanning and cleanup workflows will mirror
              the X Scrubber once platform APIs are wired up.
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        <Link href="/buyer/social" className="underline underline-offset-4">
          Back to Social Tools
        </Link>
      </p>
    </div>
  );
}
