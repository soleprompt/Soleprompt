import { currentUser } from "@clerk/nextjs/server";
import { Hero } from "@/components/landing/Hero";
import { OnboardingQuiz } from "@/components/landing/OnboardingQuiz";
import { TrustSection } from "@/components/landing/TrustSection";
import { BeforeAfterShowcase } from "@/components/landing/BeforeAfterShowcase";
import { FeaturedCollections } from "@/components/landing/FeaturedCollections";
import { FeaturedPrompts } from "@/components/landing/FeaturedPrompts";
import { TrendingPrompts } from "@/components/landing/TrendingPrompts";
import { PromptOfTheDay } from "@/components/landing/PromptOfTheDay";
import { Categories } from "@/components/landing/Categories";
import { AcademySection } from "@/components/landing/AcademySection";
import { BecomeSeller } from "@/components/landing/BecomeSeller";
import { Statistics } from "@/components/landing/Statistics";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import {
  getCategoriesWithCounts,
  getFeaturedPrompts,
  getMarketplaceStats,
  getPopularSearchTerms,
  getPublishedPromptCount,
  formatToolCountDisplay,
  getTrendingPrompts,
  getPromptOfTheDay,
  getTrustMetrics,
  getPublishedPrompts,
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

  const [featuredPrompts, trendingPrompts, promptOfTheDay, categories, stats, suggestions, publishedCount, trustMetrics, quizPrompts] =
    await Promise.all([
    getFeaturedPrompts(4),
    getTrendingPrompts(6),
    getPromptOfTheDay(),
    getCategoriesWithCounts(),
    getMarketplaceStats(),
    getPopularSearchTerms(4),
    getPublishedPromptCount(),
    getTrustMetrics(),
    getPublishedPrompts({ sort: "popular", limit: 150 }),
  ]);

  const toolCountLabel = formatToolCountDisplay(publishedCount);

  return (
    <>
      <Hero suggestions={suggestions} toolCountLabel={toolCountLabel} />
      <OnboardingQuiz prompts={quizPrompts} />
      <TrustSection toolCountLabel={toolCountLabel} metrics={trustMetrics} />
      <AcademySection />
      <BeforeAfterShowcase />
      <FeaturedCollections categories={categories} />
      {promptOfTheDay && <PromptOfTheDay prompt={promptOfTheDay} />}
      <FeaturedPrompts prompts={featuredPrompts} />
      <TrendingPrompts prompts={trendingPrompts} />
      <Categories categories={categories} />
      <BecomeSeller />
      <Statistics stats={stats} />
      <Testimonials />
      <FAQ />
    </>
  );
}
