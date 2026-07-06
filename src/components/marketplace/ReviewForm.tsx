"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/app/actions/reviews";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
  promptId: string;
  existingRating?: number;
  existingComment?: string | null;
}

export function ReviewForm({
  promptId,
  existingRating,
  existingComment,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingRating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingComment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const displayRating = hoverRating || rating;

  function handleSubmit() {
    setError(null);
    setSuccess(false);

    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }

    const formData = new FormData();
    formData.set("rating", String(rating));
    formData.set("comment", comment);

    startTransition(async () => {
      const result = await submitReview(promptId, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">
          {existingRating ? "Update your review" : "Write a review"}
        </p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              disabled={pending}
              className="rounded p-0.5 transition-colors hover:bg-electric/10"
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(value)}
              aria-label={`Rate ${value} stars`}
            >
              <Star
                className={cn(
                  "h-6 w-6",
                  value <= displayRating
                    ? "fill-electric text-electric"
                    : "text-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this prompt (optional)"
        rows={3}
        disabled={pending}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-electric/50 focus:outline-none focus:ring-2 focus:ring-electric/20"
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-sm text-electric">Thanks for your review!</p>
      )}

      <Button type="button" size="sm" disabled={pending} onClick={handleSubmit}>
        {pending ? "Submitting…" : existingRating ? "Update Review" : "Submit Review"}
      </Button>
    </div>
  );
}
