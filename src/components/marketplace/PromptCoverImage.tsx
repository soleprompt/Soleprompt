"use client";

import { useMemo, useState } from "react";
import { getGeneratedToolPreviewUrl } from "@/lib/tool-preview-svg";
import type { ToolCategorySlug } from "@/lib/tool-images";
import { resolvePromptCoverImage } from "@/lib/tool-images";
import { cn } from "@/lib/utils";

interface PromptCoverImageProps {
  title: string;
  category: string;
  coverImageUrl: string | null;
  priority?: boolean;
  className?: string;
}

export function PromptCoverImage({
  title,
  category,
  coverImageUrl,
  priority = false,
  className,
}: PromptCoverImageProps) {
  const slug = category.toLowerCase().replace(/\s+/g, "-") as ToolCategorySlug;
  const fallbackSrc = useMemo(
    () => getGeneratedToolPreviewUrl(title, slug),
    [title, slug],
  );
  const initialSrc = useMemo(
    () => resolvePromptCoverImage({ title, category, coverImageUrl }),
    [title, category, coverImageUrl],
  );
  const [src, setSrc] = useState(initialSrc);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      onError={() => {
        if (src !== fallbackSrc) setSrc(fallbackSrc);
      }}
    />
  );
}
