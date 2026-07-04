import Link from "next/link";
import { Star, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import type { Prompt } from "@/types";

interface PromptCardProps {
  prompt: Prompt;
  href?: string;
}

export function PromptCard({ prompt, href = `/prompts/${prompt.id}` }: PromptCardProps) {
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

        <CardContent className="flex-1 pt-2">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {prompt.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {prompt.tags.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-electric text-electric" />
            <span className="text-sm font-medium text-foreground">
              {prompt.rating > 0 ? prompt.rating : "—"}
            </span>
            <span className="text-xs text-muted-foreground">
              ({prompt.reviews})
            </span>
          </div>
          <span className="text-lg font-semibold text-foreground">
            ${prompt.price.toFixed(2)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
