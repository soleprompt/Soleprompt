"use client";

import type { ReactNode } from "react";
import {
  Check,
  Copy,
  Download,
  Loader2,
  Pencil,
  RefreshCw,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  StudioAlert,
  StudioLoadingState,
  StudioPendingState,
  studioGlass,
} from "@/components/studio/studio-ui";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type StudioMvpSectionProps = {
  title: string;
  icon: ReactNode;
  status: "pending" | "running" | "completed" | "failed";
  children: ReactNode;
  exportText: string;
  exportFilename: string;
  onRegenerate: () => Promise<void>;
  onSave?: () => Promise<void>;
  editContent?: ReactNode;
  disabled?: boolean;
  id?: string;
};

export function StudioMvpSection({
  title,
  icon,
  status,
  children,
  exportText,
  exportFilename,
  onRegenerate,
  onSave,
  editContent,
  disabled = false,
  id,
}: StudioMvpSectionProps) {
  const [editing, setEditing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isRunning = status === "running";
  const isPending = status === "pending";
  const hasContent = status === "completed" || status === "failed";

  async function handleCopy() {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExport() {
    const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = exportFilename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleRegenerate() {
    setActionError(null);
    setRegenerating(true);
    try {
      await onRegenerate();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Regeneration failed.",
      );
    } finally {
      setRegenerating(false);
    }
  }

  async function handleSave() {
    if (!onSave) return;
    setActionError(null);
    setSaving(true);
    try {
      await onSave();
      setEditing(false);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to save changes.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-28 overflow-hidden animate-studio-fade-in-up",
        studioGlass,
        "transition-all duration-500",
        isRunning &&
          "border-purple/30 shadow-[0_8px_48px_rgba(124,58,237,0.12)] ring-purple/10",
        hasContent && !isRunning && "border-white/[0.1]",
      )}
    >
      <div className="flex flex-col gap-4 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3.5">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
              isRunning
                ? "bg-gradient-to-br from-purple/25 to-purple/10 text-purple shadow-[0_0_24px_rgba(139,92,246,0.2)] animate-studio-step-pulse"
                : hasContent
                  ? "bg-gradient-to-br from-electric/20 to-electric/5 text-electric"
                  : "bg-white/[0.04] text-muted-foreground",
            )}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            <p className="text-xs text-muted-foreground">
              {isRunning
                ? "Generating…"
                : isPending
                  ? "Waiting to start"
                  : status === "failed"
                    ? "Generation failed — try again"
                    : "Ready"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {onSave && hasContent && (
            editing ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={saving}
                  onClick={() => setEditing(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={saving}
                  onClick={() => void handleSave()}
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Save
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled || regenerating}
                onClick={() => setEditing(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isPending || isRunning || regenerating}
            onClick={() => void handleRegenerate()}
            className="text-muted-foreground hover:text-foreground"
          >
            {regenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Regenerate
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!exportText || isPending}
            onClick={() => void handleCopy()}
            className="text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-electric" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            Copy
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!exportText || isPending}
            onClick={handleExport}
            className="border-white/[0.1] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.05]"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="border-b border-red-500/20 px-6 py-2">
          <StudioAlert variant="error">{actionError}</StudioAlert>
        </div>
      )}

      <div className="p-5 sm:p-6">
        {isRunning ? (
          <StudioLoadingState
            label={`Generating ${title.toLowerCase()}`}
            sublabel="This usually takes 15–30 seconds"
          />
        ) : isPending ? (
          <StudioPendingState message="This step will run automatically in sequence." />
        ) : editing && editContent ? (
          editContent
        ) : (
          children
        )}
      </div>
    </section>
  );
}
