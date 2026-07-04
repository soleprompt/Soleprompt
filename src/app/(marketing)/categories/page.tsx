import Link from "next/link";
import {
  Megaphone,
  Code2,
  PenLine,
  Palette,
  Briefcase,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { getCategoriesWithCounts } from "@/lib/marketplace";

const ICON_MAP: Record<string, LucideIcon> = {
  Megaphone,
  Code2,
  PenLine,
  Palette,
  Briefcase,
  GraduationCap,
};

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="Categories"
        description="Browse prompts organized by use case and industry."
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = ICON_MAP[category.icon] ?? Megaphone;
          return (
            <Link key={category.id} href={`/categories/${category.id}`}>
              <Card hover className="group transition-transform hover:-translate-y-1">
                <CardContent className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-electric/20 to-purple/20">
                    <Icon className="h-6 w-6 text-electric" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-foreground">
                        {category.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {category.count.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
