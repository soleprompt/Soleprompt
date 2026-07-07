import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryBanner } from "@/components/marketplace/CategoryBanner";
import { PromptCard } from "@/components/marketplace/PromptCard";
import { SolarCategoryLayout } from "@/components/marketplace/SolarCategoryLayout";
import {
  getCategoriesWithCounts,
  getPublishedPrompts,
} from "@/lib/marketplace";

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { slug } = await params;
  const [prompts, categories] = await Promise.all([
    getPublishedPrompts({ categorySlug: slug }),
    getCategoriesWithCounts(),
  ]);

  const categoryMeta = categories.find((c) => c.id === slug);
  const categoryName =
    categoryMeta?.name ??
    prompts[0]?.category ??
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/categories"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All Categories
      </Link>
      <CategoryBanner
        slug={slug}
        name={categoryName}
        count={prompts.length}
      />
      {categoryMeta?.description && (
        <p className="-mt-4 mb-8 max-w-3xl text-muted-foreground">
          {slug === "solar"
            ? "ROI calculators, lead scripts, objection handlers, and premium proposal packs built for solar installers and sales teams."
            : categoryMeta.description}
        </p>
      )}
      {slug === "solar" ? (
        <SolarCategoryLayout prompts={prompts} />
      ) : prompts.length === 0 ? (
        <p className="text-muted-foreground">No prompts in this category yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
}
