import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { getCategoryVisual } from "@/lib/category-visuals";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const visual = getCategoryVisual(category.id);
  const Icon = visual.icon;
  const promptLabel = `${category.count.toLocaleString()} prompt${category.count === 1 ? "" : "s"}`;

  return (
    <Link
      href={`/categories/${category.id}`}
      className={cn(
        "group block rounded-2xl outline-none",
        "focus-visible:ring-2 focus-visible:ring-electric/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Card
        hover
        className={cn(
          "overflow-hidden transition-all duration-200",
          "group-hover:-translate-y-1.5 group-hover:border-electric/40 group-hover:shadow-xl group-hover:shadow-electric/10",
          "group-focus-visible:-translate-y-1.5 group-focus-visible:border-electric/40 group-focus-visible:shadow-xl group-focus-visible:shadow-electric/10",
        )}
      >
        <div
          className={cn(
            "relative h-28 bg-gradient-to-br transition-all duration-200",
            "group-hover:brightness-110 group-focus-visible:brightness-110",
            visual.gradient,
          )}
        >
          <div
            className="absolute inset-0 opacity-40 transition-opacity duration-200 group-hover:opacity-55 group-focus-visible:opacity-55"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,102,255,0.12) 0%, transparent 40%)",
            }}
          />
          <span
            className={cn(
              "absolute right-4 top-3 text-2xl opacity-70 select-none transition-all duration-200",
              "group-hover:scale-110 group-hover:opacity-90",
              "group-focus-visible:scale-110 group-focus-visible:opacity-90",
            )}
            aria-hidden
          >
            {visual.emoji}
          </span>
          <div
            className={cn(
              "absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-200",
              "group-hover:scale-110 group-hover:ring-2 group-focus-visible:scale-110 group-focus-visible:ring-2",
              visual.ringColor,
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6 transition-all duration-200",
                "group-hover:brightness-125 group-focus-visible:brightness-125",
                visual.iconColor,
              )}
            />
          </div>
          <div
            className={cn(
              "absolute bottom-0 left-0 h-0.5 w-0 bg-electric transition-all duration-200",
              "group-hover:w-full group-focus-visible:w-full",
            )}
            aria-hidden
          />
        </div>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground">
              <span className="relative inline-block">
                {category.name}
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-0 h-px w-0 bg-electric transition-all duration-200",
                    "group-hover:w-full group-focus-visible:w-full",
                  )}
                  aria-hidden
                />
              </span>
            </h3>
            <span
              className={cn(
                "shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground transition-all duration-200",
                "group-hover:bg-electric/15 group-hover:text-electric",
                "group-focus-visible:bg-electric/15 group-focus-visible:text-electric",
              )}
            >
              {category.count.toLocaleString()}
            </span>
          </div>
          <p
            className={cn(
              "mt-1.5 line-clamp-2 text-sm text-muted-foreground transition-colors duration-200",
              "group-hover:text-foreground/75 group-focus-visible:text-foreground/75",
            )}
          >
            {category.description}
          </p>
          <p
            className={cn(
              "mt-2 flex items-center gap-1 text-xs font-medium text-electric transition-all duration-200",
              "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
            )}
          >
            Browse {promptLabel}
            <ArrowRight
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                "group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5",
              )}
            />
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
