"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { approvePrompt, rejectPrompt } from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";

interface AdminPromptActionsProps {
  promptId: string;
}

export function AdminPromptActions({ promptId }: AdminPromptActionsProps) {
  const [pending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(() => approvePrompt(promptId));
  }

  function handleReject() {
    if (confirm("Reject this prompt? The seller will see it as rejected.")) {
      startTransition(() => rejectPrompt(promptId));
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="primary"
        size="sm"
        className="gap-1.5"
        disabled={pending}
        onClick={handleApprove}
      >
        <Check className="h-4 w-4" />
        Approve
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={pending}
        onClick={handleReject}
      >
        <X className="h-4 w-4" />
        Reject
      </Button>
    </div>
  );
}
