import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryBanner } from "@/components/marketplace/CategoryBanner";
import { CategoryLandingLayout } from "@/components/marketplace/CategoryLandingLayout";
import { PromptCard } from "@/components/marketplace/PromptCard";
import {
  getCategoriesWithCounts,
  getPublishedPrompts,
} from "@/lib/marketplace";
import {
  getCategoryLandingConfig,
  CATEGORY_LANDING,
} from "@/lib/category-landing";

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = getCategoryLandingConfig(slug);

  if (config) {
    return {
      title: config.seoTitle,
      description: config.seoDescription,
    };
  }

  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${name} AI Tools`,
    description: `Browse ${name.toLowerCase()} AI tools on SolePrompt.`,
  };
}

export function generateStaticParams() {
  return Object.keys(CATEGORY_LANDING).map((slug) => ({ slug }));
}

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { slug } = await params;
  const landingConfig = getCategoryLandingConfig(slug);

  const [prompts, categories] = await Promise.all([
    getPublishedPrompts({ categorySlug: slug }),
    getCategoriesWithCounts(),
  ]);

  const crossSellPrompts = landingConfig?.crossSellSlug
    ? await getPublishedPrompts({
        categorySlug: landingConfig.crossSellSlug,
        limit: 6,
        sort: "popular",
      })
    : [];

  const categoryMeta = categories.find((c) => c.id === slug);
  const categoryName =
    categoryMeta?.name ??
    prompts[0]?.category ??
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const tagline =
    landingConfig?.tagline ?? categoryMeta?.description ?? "";

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
      {tagline && (
        <p className="-mt-4 mb-8 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {tagline}
        </p>
      )}

      {landingConfig ? (
        <CategoryLandingLayout
          config={landingConfig}
          prompts={prompts}
          crossSellPrompts={crossSellPrompts}
        />
      ) : prompts.length === 0 ? (
        <p className="text-muted-foreground">No tools in this category yet.</p>
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
