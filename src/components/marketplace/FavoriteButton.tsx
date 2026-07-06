"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { toggleWishlist } from "@/app/actions/wishlist";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  promptId: string;
  initialSaved?: boolean;
  className?: string;
}

export function FavoriteButton({
  promptId,
  initialSaved = false,
  className,
}: FavoriteButtonProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!isSignedIn) {
      const returnUrl = encodeURIComponent(`/prompts/${promptId}`);
      window.location.href = `/sign-in?redirect_url=${returnUrl}`;
      return;
    }

    startTransition(async () => {
      const result = await toggleWishlist(promptId);
      if (result && "saved" in result && typeof result.saved === "boolean") {
        setSaved(result.saved);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={!isLoaded || pending}
      className={cn("gap-2", saved && "border-electric/40 text-electric", className)}
      onClick={handleClick}
    >
      <Heart
        className={cn("h-4 w-4", saved && "fill-electric text-electric")}
      />
      {pending ? "Saving…" : saved ? "Saved" : "Save"}
    </Button>
  );
}
