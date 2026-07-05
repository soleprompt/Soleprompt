"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import { startPurchase } from "@/app/actions/purchase";
import { Button } from "@/components/ui/Button";

interface PurchaseButtonProps {
  promptId: string;
  price: number;
  purchased?: boolean;
  isOwnPrompt?: boolean;
}

export function PurchaseButton({
  promptId,
  price,
  purchased = false,
  isOwnPrompt = false,
}: PurchaseButtonProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (purchased) {
    return (
      <Link href={`/prompts/${promptId}#full-prompt`} className="mt-6 block">
        <Button type="button" className="w-full">
          Open Prompt
        </Button>
      </Link>
    );
  }

  if (isOwnPrompt) {
    return (
      <Button type="button" className="mt-6 w-full" disabled>
        Your Prompt
      </Button>
    );
  }

  function handlePurchase() {
    setError(null);

    if (!isSignedIn) {
      const returnUrl = encodeURIComponent(`/prompts/${promptId}`);
      window.location.href = `/sign-in?redirect_url=${returnUrl}`;
      return;
    }

    startTransition(async () => {
      const result = await startPurchase(promptId);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  const label = isPending
    ? price <= 0
      ? "Getting pack…"
      : "Starting checkout…"
    : price <= 0
      ? "Get Free Pack"
      : "Purchase Prompt";

  return (
    <div className="mt-6">
      <Button
        type="button"
        className="w-full"
        onClick={handlePurchase}
        disabled={!isLoaded || isPending}
      >
        {label}
      </Button>
      {error && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
