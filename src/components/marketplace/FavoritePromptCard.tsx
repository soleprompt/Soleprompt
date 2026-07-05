import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import { RemoveFavoriteButton } from "@/components/marketplace/RemoveFavoriteButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Prompt } from "@/types";

export interface FavoritePromptItem {
  id: string;
  addedAt: Date;
  prompt: Prompt;
}

interface FavoritePromptCardProps {
  item: FavoritePromptItem;
}

export function FavoritePromptCard({ item }: FavoritePromptCardProps) {
  const { prompt } = item;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline">{prompt.category}</Badge>
          <Badge variant="electric">{formatCurrency(prompt.price)}</Badge>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          {prompt.title}
        </h3>
      </CardHeader>

      <CardContent className="flex-1 pt-2">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {prompt.description}
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-electric text-electric" />
          <span>{prompt.rating > 0 ? prompt.rating : "—"}</span>
          <span>({prompt.reviews} reviews)</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Saved {formatDate(item.addedAt)}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        <Link href={`/prompts/${prompt.id}`} className="w-full sm:flex-1">
          <Button variant="primary" className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            View Prompt
          </Button>
        </Link>
        <RemoveFavoriteButton wishlistId={item.id} className="w-full sm:flex-1" />
      </CardFooter>
    </Card>
  );
}
