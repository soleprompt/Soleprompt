import Link from "next/link";
import { Sparkles, Star, ShoppingBag, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import type { Prompt } from "@/types";

interface PromptOfTheDayProps {
  prompt: Prompt;
}

export function PromptOfTheDay({ prompt }: PromptOfTheDayProps) {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-electric/20 bg-gradient-to-br from-electric/5 via-background to-purple/5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="h-5 w-5 text-electric" />
            <span className="text-sm font-semibold uppercase tracking-wide text-electric">
              Prompt of the Day
            </span>
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <Badge variant="outline" className="mb-3">
                {prompt.category}
              </Badge>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                {prompt.title}
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                {prompt.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-electric text-electric" />
                  {prompt.rating > 0 ? prompt.rating : "—"} ({prompt.reviews})
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {prompt.salesCount} sold
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {prompt.viewCount.toLocaleString()} views
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(prompt.price)}
              </p>
              <Link href={`/prompts/${prompt.id}`}>
                <Button size="lg">View Prompt</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
