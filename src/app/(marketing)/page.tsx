import { Hero } from "@/components/landing/Hero";
import { FeaturedPrompts } from "@/components/landing/FeaturedPrompts";
import { Categories } from "@/components/landing/Categories";
import { BecomeSeller } from "@/components/landing/BecomeSeller";
import { Statistics } from "@/components/landing/Statistics";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import {
  getCategoriesWithCounts,
  getFeaturedPrompts,
  getMarketplaceStats,
  getPopularSearchTerms,
} from "@/lib/marketplace";

export default async function HomePage() {
  const [featuredPrompts, categories, stats, suggestions] = await Promise.all([
    getFeaturedPrompts(4),
    getCategoriesWithCounts(),
    getMarketplaceStats(),
    getPopularSearchTerms(4),
  ]);

  return (
    <>
      <Hero suggestions={suggestions} />
      <FeaturedPrompts prompts={featuredPrompts} />
      <Categories categories={categories} />
      <BecomeSeller />
      <Statistics stats={stats} />
      <Testimonials />
      <FAQ />
    </>
  );
}
