"use client";

import Link from "next/link";
import {
  Star,
  ArrowUpRight,
  Download,
  ShoppingBag,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { ModelBadge } from "@/components/ui/ModelLogo";
import { trackClickThrough } from "@/lib/click-throughs/client";
import {
  getCompatibleModelBadges,
  getPromptBenefit,
} from "@/lib/prompt-thumbnails";
import { BADGE_STYLES, getPromptBadges } from "@/lib/prompt-badges";
import { resolvePromptCoverImage } from "@/lib/tool-images";
import {
  formatCurrency,
  formatPurchaseAmount,
  getCompareAtPrice,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/types";

interface PromptCardProps {
  prompt: Prompt;
  href?: string;
  variant?: "compact" | "rich";
  trendingIds?: string[];
}

function PromptThumbnail({
  prompt,
  trendingIds,
}: {
  prompt: Prompt;
  trendingIds?: string[];
}) {
  const badges = getPromptBadges(prompt, {
    trendingIds: trendingIds ? new Set(trendingIds) : undefined,
  });
  const thumbnailSrc = resolvePromptCoverImage(prompt);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a0a12]">
      <div className="absolute left-3 top-3 z-10 flex max-w-[70%] flex-wrap gap-1">
        {badges.map((badge) => (
          <span
            key={badge.type}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[9px] font-semibold backdrop-blur-sm",
              BADGE_STYLES[badge.type],
            )}
          >
            {badge.label}
          </span>
        ))}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnailSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
    </div>
  );
}

function PriceDisplay({ price }: { price: number }) {
  const compareAt = getCompareAtPrice(price);

  if (price <= 0) {
    return <span className="font-semibold text-emerald-400">Free</span>;
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-baseline gap-2">
        {compareAt && (
          <span className="text-sm text-muted-foreground line-through">
            {formatCurrency(compareAt)}
          </span>
        )}
        <span className="font-semibold text-foreground">
          {formatPurchaseAmount(price)}
        </span>
      </div>
    </div>
  );
}

function RatingDisplay({ prompt }: { prompt: Prompt }) {
  if (prompt.rating > 0) {
    return (
      <div className="flex items-center gap-1">
        <Star className="h-3.5 w-3.5 fill-electric text-electric" />
        <span className="text-sm font-medium">{prompt.rating.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">
          ({prompt.reviews.toLocaleString()})
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <Star className="h-3.5 w-3.5" />
      <span>New</span>
    </div>
  );
}

export function PromptCard({
  prompt,
  href = `/prompts/${prompt.id}`,
  variant = "rich",
  trendingIds,
}: PromptCardProps) {
  const benefit = getPromptBenefit(prompt.description, prompt.estimatedTimeSaved);
  const modelBadges = getCompatibleModelBadges(prompt.compatibleModels);
  const buyLabel =
    prompt.price <= 0 ? "Get Free" : `Buy · ${formatCurrency(prompt.price)}`;

  function handleClick() {
    trackClickThrough({
      eventType: "marketplace_click",
      targetKey: prompt.id,
      metadata: { promptTitle: prompt.title },
    });
  }

  const metaRow = (
    <div className="mt-3 space-y-2 border-t border-border/40 pt-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <User className="h-3 w-3 shrink-0" />
        <span className="truncate">{prompt.seller.displayName}</span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RatingDisplay prompt={prompt} />
        <PriceDisplay price={prompt.price} />
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {prompt.salesCount > 0 ? (
          <>
            <ShoppingBag className="h-3 w-3" />
            {prompt.salesCount.toLocaleString()} downloads
          </>
        ) : (
          <>
            <Download className="h-3 w-3" />
            Instant download
          </>
        )}
      </div>
    </div>
  );

  if (variant === "compact") {
    return (
      <Card hover className="group flex h-full flex-col overflow-hidden">
        <Link href={href} className="flex flex-1 flex-col" onClick={handleClick}>
          <PromptThumbnail prompt={prompt} trendingIds={trendingIds} />
          <CardContent className="flex flex-1 flex-col pt-3">
            <div className="flex flex-wrap gap-1">
              {modelBadges.slice(0, 2).map((model) => (
                <ModelBadge key={model} model={model} size="sm" className="px-1.5 text-[9px]" />
              ))}
            </div>
            <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">
              {prompt.title}
            </h3>
            {metaRow}
          </CardContent>
        </Link>
      </Card>
    );
  }

  return (
    <Card hover className="group flex h-full flex-col overflow-hidden">
      <Link href={href} className="block" onClick={handleClick}>
        <PromptThumbnail prompt={prompt} trendingIds={trendingIds} />
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
            <ModelBadge key={model} model={model} />
          ))}
        </div>

        {metaRow}
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
