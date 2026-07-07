"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ArrowUpRight,
  Download,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { trackClickThrough } from "@/lib/click-throughs/client";
import {
  getCompatibleModelBadges,
  getPromptBenefit,
  getPromptDifficultyTier,
} from "@/lib/prompt-thumbnails";
import { isSvgImageSrc, resolvePromptCoverImage } from "@/lib/tool-images";
import { formatCurrency, formatPurchaseAmount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/types";

interface PromptCardProps {
  prompt: Prompt;
  href?: string;
  variant?: "compact" | "rich";
}

const MODEL_BADGE_STYLES: Record<string, string> = {
  ChatGPT: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  Claude: "border-orange-500/25 bg-orange-500/10 text-orange-300",
  Gemini: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  Grok: "border-zinc-500/25 bg-zinc-500/10 text-zinc-300",
};

function PromptThumbnail({
  prompt,
  difficulty,
}: {
  prompt: Prompt;
  difficulty: string;
}) {
  const difficultyBadge = (
    <Badge
      variant={difficulty === "Pro" ? "electric" : "outline"}
      className="absolute left-3 top-3 z-10 text-[10px] font-semibold backdrop-blur-sm"
    >
      {difficulty}
    </Badge>
  );

  const thumbnailSrc = resolvePromptCoverImage(prompt);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden">
      {difficultyBadge}
      <Image
        src={thumbnailSrc}
        alt=""
        fill
        unoptimized={isSvgImageSrc(thumbnailSrc)}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
    </div>
  );
}

export function PromptCard({
  prompt,
  href = `/prompts/${prompt.id}`,
  variant = "rich",
}: PromptCardProps) {
  const benefit = getPromptBenefit(prompt.description, prompt.estimatedTimeSaved);
  const difficulty = getPromptDifficultyTier(prompt);
  const modelBadges = getCompatibleModelBadges(prompt.compatibleModels);
  const downloadCount = prompt.salesCount;
  const buyLabel =
    prompt.price <= 0 ? "Get Free" : `Buy · ${formatCurrency(prompt.price)}`;

  function handleClick() {
    trackClickThrough({
      eventType: "marketplace_click",
      targetKey: prompt.id,
      metadata: { promptTitle: prompt.title },
    });
  }

  if (variant === "compact") {
    return (
      <Card hover className="group flex h-full flex-col overflow-hidden">
        <Link href={href} className="flex flex-1 flex-col" onClick={handleClick}>
          <PromptThumbnail prompt={prompt} difficulty={difficulty} />
          <CardContent className="flex flex-1 flex-col pt-4">
            <div className="flex flex-wrap gap-1">
              {modelBadges.slice(0, 2).map((model) => (
                <span
                  key={model}
                  className={cn(
                    "rounded-full border px-1.5 py-0.5 text-[9px] font-medium",
                    MODEL_BADGE_STYLES[model] ?? "border-border bg-muted/50 text-muted-foreground",
                  )}
                >
                  {model}
                </span>
              ))}
            </div>
            <h3 className="mt-2 line-clamp-2 text-base font-semibold text-foreground">
              {prompt.title}
            </h3>
            <div className="mt-auto flex items-center justify-between pt-3">
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3.5 w-3.5 fill-electric text-electric" />
                <span>{prompt.rating > 0 ? prompt.rating : "—"}</span>
              </div>
              <span className="font-semibold text-foreground">
                {formatPurchaseAmount(prompt.price)}
              </span>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  return (
    <Card hover className="group flex h-full flex-col overflow-hidden">
      <Link href={href} className="block" onClick={handleClick}>
        <PromptThumbnail prompt={prompt} difficulty={difficulty} />
      </Link>

      <CardContent className="flex flex-1 flex-col pt-4">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className="text-[10px]">
            {prompt.category}
          </Badge>
          <Link
            href={href}
            onClick={handleClick}
            className="flex h-7 w-7 items-center justify-center rounded-full opacity-0 transition-all group-hover:opacity-100 hover:bg-electric/10"
            aria-label={`View ${prompt.title}`}
          >
            <ArrowUpRight className="h-4 w-4 text-electric" />
          </Link>
        </div>

        <Link href={href} onClick={handleClick} className="mt-3 block">
          <h3 className="line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-electric">
            {prompt.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {benefit}
          </p>
        </Link>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {modelBadges.map((model) => (
            <span
              key={model}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                MODEL_BADGE_STYLES[model] ?? "border-border bg-muted/50 text-muted-foreground",
              )}
            >
              {model}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/40 pt-3">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-electric text-electric" />
            <span className="text-sm font-medium text-foreground">
              {prompt.rating > 0 ? prompt.rating : "New"}
            </span>
            {prompt.reviews > 0 && (
              <span className="text-xs text-muted-foreground">
                ({prompt.reviews})
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-foreground">
            {formatPurchaseAmount(prompt.price)}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {downloadCount > 0 ? (
              <>
                <ShoppingBag className="h-3 w-3" />
                {downloadCount.toLocaleString()} downloads
              </>
            ) : (
              <>
                <Download className="h-3 w-3" />
                Instant download
              </>
            )}
          </span>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/50 pt-4">
        <Link href={href} onClick={handleClick} className="w-full">
          <Button size="sm" className="w-full">
            {buyLabel}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
