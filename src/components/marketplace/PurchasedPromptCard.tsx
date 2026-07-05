import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { DownloadPromptButton } from "@/components/marketplace/DownloadPromptButton";
import { formatDate, formatPurchaseAmount } from "@/lib/format";
import type { Prompt } from "@/types";

export interface PurchasedPromptItem {
  id: string;
  purchasedAt: Date;
  amount: number;
  prompt: Prompt;
}

interface PurchasedPromptCardProps {
  purchase: PurchasedPromptItem;
}

export function PurchasedPromptCard({ purchase }: PurchasedPromptCardProps) {
  const { prompt } = purchase;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline">{prompt.category}</Badge>
          <Badge variant={purchase.amount <= 0 ? "purple" : "electric"}>
            {formatPurchaseAmount(purchase.amount)}
          </Badge>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          {prompt.title}
        </h3>
      </CardHeader>

      <CardContent className="flex-1 pt-2">
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {prompt.description}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Purchased {formatDate(purchase.purchasedAt)}
        </p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          ID: {purchase.id}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        <Link href={`/prompts/${prompt.id}`} className="w-full sm:flex-1">
          <Button variant="primary" className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            Open Prompt
          </Button>
        </Link>
        <DownloadPromptButton
          title={prompt.title}
          content={prompt.content}
          className="w-full gap-2 sm:flex-1"
        />
      </CardFooter>
    </Card>
  );
}
