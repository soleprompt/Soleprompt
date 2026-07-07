"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Star,
  ArrowUpRight,
  Download,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { ModelBadge } from "@/components/ui/ModelLogo";
import { trackClickThrough } from "@/lib/click-throughs/client";
import {
  getCompatibleModelBadges,
  getPromptBenefit,
  getPromptDifficultyTier,
} from "@/lib/prompt-thumbnails";
import { isSvgImageSrc, resolvePromptCoverImage } from "@/lib/tool-images";
import {
  formatCurrency,
  formatPurchaseAmount,
  getCompareAtPrice,
} from "@/lib/format";
import type { Prompt } from "@/types";

interface PromptCardProps {
  prompt: Prompt;
  href?: string;
  variant?: "compact" | "rich";
}

function PromptThumbnail({
  prompt,
  difficulty,
}: {
  prompt: Prompt;
  difficulty: string;
}) {
  const isBestseller = prompt.salesCount >= 10;
  const isNew =
    prompt.reviews === 0 &&
    prompt.rating === 0 &&
    prompt.salesCount < 5;

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
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a0a12]">
      {difficultyBadge}
      {isBestseller && (
        <Badge
          variant="electric"
          className="absolute right-3 top-3 z-10 gap-1 text-[10px] font-semibold backdrop-blur-sm"
        >
          <TrendingUp className="h-3 w-3" />
          Bestseller
        </Badge>
      )}
      {isNew && !isBestseller && (
        <Badge
          variant="outline"
          className="absolute right-3 top-3 z-10 gap-1 border-purple/40 bg-purple/10 text-[10px] font-semibold text-purple-300 backdrop-blur-sm"
        >
          <Sparkles className="h-3 w-3" />
          New
        </Badge>
      )}
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
      {compareAt && (
        <span className="text-[10px] font-medium text-electric/80">
          Limited launch pricing
        </span>
      )}
    </div>
  );
}

function RatingDisplay({ prompt }: { prompt: Prompt }) {
  if (prompt.rating > 0) {
    return (
      <div className="flex items-center gap-1.5">
        <Star className="h-3.5 w-3.5 fill-electric text-electric" />
        <span className="text-sm font-medium text-foreground">
          {prompt.rating.toFixed(1)}
        </span>
        {prompt.reviews > 0 && (
          <span className="text-xs text-muted-foreground">
            ({prompt.reviews.toLocaleString()})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Star className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-sm font-medium text-muted-foreground">New</span>
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
                <ModelBadge key={model} model={model} size="sm" className="px-1.5 text-[9px]" />
              ))}
            </div>
            <h3 className="mt-2 line-clamp-2 text-base font-semibold text-foreground">
              {prompt.title}
            </h3>
            <div className="mt-auto flex items-center justify-between pt-3">
              <RatingDisplay prompt={prompt} />
              <PriceDisplay price={prompt.price} />
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
            <ModelBadge key={model} model={model} />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/40 pt-3">
          <RatingDisplay prompt={prompt} />
          <PriceDisplay price={prompt.price} />
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
