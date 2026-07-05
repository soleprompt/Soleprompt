import Link from "next/link";
import {
  Star,
  ArrowUpRight,
  Cpu,
  ShoppingBag,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { Prompt } from "@/types";

interface PromptCardProps {
  prompt: Prompt;
  href?: string;
  variant?: "compact" | "rich";
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function PromptCard({
  prompt,
  href = `/prompts/${prompt.id}`,
  variant = "rich",
}: PromptCardProps) {
  return (
    <Link href={href} className="block h-full">
      <Card hover className="group flex h-full flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <Badge variant="outline">{prompt.category}</Badge>
            <span className="flex h-8 w-8 items-center justify-center rounded-full opacity-0 transition-all group-hover:opacity-100 hover:bg-electric/10">
              <ArrowUpRight className="h-4 w-4 text-electric" />
            </span>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            {prompt.title}
          </h3>
        </CardHeader>

        <CardContent className="flex-1 space-y-4 pt-2">
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {prompt.description}
          </p>

          {variant === "rich" && prompt.preview && (
            <div className="rounded-lg border border-border/60 bg-foreground/[0.02] px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Preview
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground/80">
                {prompt.preview}
              </p>
            </div>
          )}

          {variant === "rich" && prompt.compatibleModels.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <Cpu className="h-3 w-3" />
                Compatible Models
              </p>
              <div className="flex flex-wrap gap-1.5">
                {prompt.compatibleModels.slice(0, 3).map((model) => (
                  <Badge key={model} variant="electric">
                    {model}
                  </Badge>
                ))}
                {prompt.compatibleModels.length > 3 && (
                  <Badge variant="default">
                    +{prompt.compatibleModels.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {variant === "rich" && prompt.sampleOutput && (
            <div className="rounded-lg border border-electric/20 bg-electric/5 px-3 py-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-electric">
                Sample Output
              </p>
              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-foreground/80">
                {truncate(prompt.sampleOutput, 180)}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {prompt.tags.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>

          {variant === "rich" && (
            <div className="flex items-start gap-2 border-t border-border/50 pt-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-electric/20 to-purple/20">
                <User className="h-4 w-4 text-electric" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {prompt.seller.displayName}
                </p>
                {prompt.seller.bio && (
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {prompt.seller.bio}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-electric text-electric" />
              <span className="text-sm font-medium text-foreground">
                {prompt.rating > 0 ? prompt.rating : "—"}
              </span>
              <span className="text-xs text-muted-foreground">
                ({prompt.reviews})
              </span>
            </div>
            {variant === "rich" && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ShoppingBag className="h-3 w-3" />
                {prompt.salesCount.toLocaleString()} sold
              </span>
            )}
          </div>
          <span className="text-lg font-semibold text-foreground">
            {formatCurrency(prompt.price)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
