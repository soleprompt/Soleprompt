import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Clock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PromptCard } from "@/components/marketplace/PromptCard";
import { getBuyerRecentlyViewed } from "@/lib/marketplace";

export default async function BuyerRecentPage() {
  const user = await currentUser();
  const recent = user ? await getBuyerRecentlyViewed(user.id) : [];

  return (
    <>
      <PageHeader
        title="Recently Viewed"
        description="Prompts you've browsed recently."
      />
      {recent.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No recent activity"
          description="Prompts you view will show up here so you can quickly find them again."
          action={
            <Link
              href="/explore"
              className="mt-4 inline-block text-sm text-electric hover:underline"
            >
              Explore prompts
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((item) => (
            <PromptCard key={item.id} prompt={item.prompt} />
          ))}
        </div>
      )}
    </>
  );
}
