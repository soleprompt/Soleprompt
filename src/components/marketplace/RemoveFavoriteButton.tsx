"use client";

import { useTransition } from "react";
import { HeartOff } from "lucide-react";
import { removeFromWishlist } from "@/app/actions/wishlist";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface RemoveFavoriteButtonProps {
  wishlistId: string;
  className?: string;
}

export function RemoveFavoriteButton({
  wishlistId,
  className,
}: RemoveFavoriteButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      className={cn("gap-2", className)}
      onClick={() => startTransition(() => removeFromWishlist(wishlistId))}
    >
      <HeartOff className="h-4 w-4" />
      {pending ? "Removing…" : "Remove"}
    </Button>
  );
}
