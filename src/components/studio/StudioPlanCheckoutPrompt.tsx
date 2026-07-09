"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { startStudioSubscriptionCheckout } from "@/app/actions/studio-subscription";
import type { StudioTierId } from "@/lib/studio/subscription-catalog";

function isPaidTier(plan: string): plan is Exclude<StudioTierId, "free"> {
  return plan === "creator" || plan === "pro" || plan === "agency";
}

type StudioPlanCheckoutPromptProps = {
  plan?: string;
  isPaid: boolean;
};

export function StudioPlanCheckoutPrompt({
  plan,
  isPaid,
}: StudioPlanCheckoutPromptProps) {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const hasCheckoutParam =
      url.searchParams.has("plan") ||
      url.searchParams.has("subscribed") ||
      url.searchParams.has("canceled");

    if (hasCheckoutParam) {
      router.replace("/studio/projects", { scroll: false });
    }
  }, [router]);

  useEffect(() => {
    if (!plan || !isPaidTier(plan) || isPaid || started.current) {
      return;
    }

    started.current = true;

    void startStudioSubscriptionCheckout(plan).then((result) => {
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    });
  }, [plan, isPaid]);

  if (!error) {
    return null;
  }

  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {error}
    </div>
  );
}
