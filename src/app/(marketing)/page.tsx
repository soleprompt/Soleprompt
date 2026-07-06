import { currentUser } from "@clerk/nextjs/server";
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
import { recordToolVisit } from "@/lib/tool-visits";
import { parseUtmAttribution } from "@/lib/utm";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await currentUser();
  const utmParams = parseUtmAttribution(await searchParams);
  void recordToolVisit("homepage", user?.id, utmParams);

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
